"use strict";
// ─────────────────────────────────────────────────────────────────────────────
//  A.I.T Transport — Backend API v3.0
//  MySQL + Prisma  |  IP: 192.168.100.100  |  Port: 3001
//  Routes alignées sur apiClient.ts :
//    POST /api/login
//    GET/POST/PATCH/DELETE /api/tickets
//    GET/POST /api/departs
//    POST /api/departs/:id/cloture        ← cloturerDepart()
//    GET/POST/PATCH/DELETE /api/utilisateurs
//    GET /api/agences
//    GET /api/ping  |  GET /api/health
//    GET/POST /api/depenses
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();

const express          = require("express");
const cors             = require("cors");
const helmet           = require("helmet");
const rateLimit        = require("express-rate-limit");
const morgan           = require("morgan");
const jwt              = require("jsonwebtoken");
const bcrypt           = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const fs               = require("fs");
const path             = require("path");

const app    = express();
const PORT   = Number(process.env.PORT) || 3001;
const SECRET = process.env.JWT_SECRET   || "3b43c07c8f8437dc2b2ce64b82e71b9db9efeeffec3293af77cf57b3d47b4c9d";
const prisma = new PrismaClient({ log: ["error"] });

// ─── LOGS ─────────────────────────────────────────────────────────────────────
const LOG_DIR  = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "erreurs.log");
try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch {}
function logErr(ctx, err) {
  const line = `[${new Date().toISOString()}] ${ctx}: ${err?.message || err}\n`;
  console.error(line.trim());
  try { fs.appendFileSync(LOG_FILE, line); } catch {}
}

// ─── CORS + MIDDLEWARE ────────────────────────────────────────────────────────
const origins = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean)
  .concat(["http://192.168.100.100:5173", "http://localhost:5173"]);

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

// --- SECURITE (ajoutee par BSIP - audit V3-PG) ---
app.use(helmet({ contentSecurityPolicy: false }));
const loginLimiter = rateLimit({ windowMs: 900000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: "Trop de tentatives de connexion. Reessayez dans 15 minutes." } });
app.use("/api/login", loginLimiter);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return res.status(401).json({ error: "Token manquant." });
  try { req.user = jwt.verify(t, SECRET); next(); }
  catch { return res.status(401).json({ error: "Token invalide ou expire." }); }
}
function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (!["admin","gestionnaire"].includes(req.user.role))
      return res.status(403).json({ error: "Reserve aux gestionnaires." });
    next();
  });
}

// ═════════════════════════════════════════════════════════════════════════════
//  PUBLIQUES
// ═════════════════════════════════════════════════════════════════════════════

app.get("/", (_q, r) => r.json({ app:"A.I.T Transport API", version:"3.0", status:"OK" }));

app.get("/api/ping", (_q, r) =>
  r.json({ status:"OK", ts: new Date().toISOString(), uptime: Math.floor(process.uptime()) })
);

app.get("/api/health", async (_q, r) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    r.json({ status:"OK", db:"MySQL connecte", ts: new Date().toISOString() });
  } catch(e) { r.status(503).json({ status:"ERROR", error: e.message }); }
});

// Page statut pour PC vendeurs
app.get("/status", (_q, r) => {
  r.send(`<!DOCTYPE html><html><head><meta charset="utf-8">
<meta http-equiv="refresh" content="30"><title>AIT Statut</title>
<style>body{font-family:Arial;background:#0f172a;color:#e2e8f0;padding:40px;text-align:center;}
h1{color:#f5d020;}.ok{color:#4ade80;font-size:20px;}.url{background:#1e293b;padding:10px 20px;
border-radius:8px;font-family:monospace;display:inline-block;margin:10px;}</style></head><body>
<h1>A.I.T Transport</h1>
<p class="ok">Serveur operationnel — MySQL actif</p>
<p>Uptime : ${Math.floor(process.uptime()/60)} min</p>
<br><p><b>PC Vendeurs :</b></p>
<div class="url">http://192.168.100.100:5173</div>
</body></html>`);
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
app.post("/api/login", async (req, r) => {
  const { username, login: loginField, password, pin } = req.body || {};
  const u_login = username || loginField;
  const u_pass  = password || pin;
  if (!u_login || !u_pass)
    return r.status(400).json({ error: "Login et mot de passe requis." });
  try {
    const u = await prisma.utilisateurs.findUnique({ where: { login: u_login } });
    if (!u)           return r.status(401).json({ error: "Utilisateur introuvable." });
    if (!u.is_active) return r.status(401).json({ error: "Compte inactif." });
    // Supporte les 2 formats : texte clair (legacy) ET bcrypt hash
    const pwdOk = u.password.startsWith("$2")
      ? await bcrypt.compare(u_pass, u.password)
      : u.password === u_pass;
    if (!pwdOk) return r.status(401).json({ error: "Mot de passe incorrect." });
    const token = jwt.sign(
      { login: u.login, role: u.role, agence: u.agence_id },
      SECRET, { expiresIn: "12h" }
    );
    r.json({
      token,
      user: {
        id: u.login, username: u.login, login: u.login,
        role: u.role, agencyId: u.agence_id, agence_id: u.agence_id,
        fullName: u.full_name, full_name: u.full_name,
      },
    });
  } catch(e) { logErr("login", e); r.status(503).json({ error: e.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
//  TICKETS
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/tickets", auth, async (req, r) => {
  try {
    const { date, trajet, statut } = req.query;
    const isAdmin = ["admin","gestionnaire"].includes(req.user.role);
    const where = {};
    if (!isAdmin) where.agence_id = req.user.agence;
    if (date)   where.date   = date;
    if (trajet) where.trajet = trajet;
    if (statut) where.statut = statut;
    const rows = await prisma.tickets.findMany({
      where, orderBy: [{ date:"desc" }, { heure:"desc" }]
    });
    r.json(rows);
  } catch(e) { logErr("GET tickets", e); r.status(503).json({ error: e.message }); }
});

app.post("/api/tickets", auth, async (req, r) => {
  const b = req.body || {};
  // Accepte les 2 formats : MAJUSCULES (ancien) et camelCase (apiClient.ts)
  const data = {
    numero       : b.NUMERO        || b.numero,
    trajet       : b.TRAJET        || b.trajet,
    date         : b.DATE          || b.date,
    heure        : b.HEURE         || b.heure,
    sieges       : b.SIEGES        || b.sieges ||
                   (Array.isArray(b.siege) ? b.siege.join(",") : String(b.siege || "")),
    nom          : b.NOM           || b.nom          || "Client",
    telephone    : b.TELEPHONE     || b.telephone    || "",
    paiement     : b.PAIEMENT      || b.paiement     || "Especes",
    montant      : Number(b.MONTANT ?? b.montant)     || 0,
    statut       : b.STATUT        || b.statut       || "vendu",
    car_id       : b.CAR_ID        || b.car_id       || b.carId       || "",
    car_matricule: b.CAR_MATRICULE || b.car_matricule|| b.carMatricule|| "",
    car_model    : b.CAR_MODEL     || b.car_model    || b.carModel    || "",
    car_serial   : b.CAR_SERIAL    || b.car_serial   || b.carSerial   || "",
    agence_id    : b.AGENCE_ID     || b.agence_id    || b.agencyId    || req.user.agence || "soubre",
  };
  if (!data.numero || !data.trajet || !data.date || !data.heure)
    return r.status(400).json({ error: "numero, trajet, date, heure requis." });
  try {
    await prisma.tickets.create({ data });
    r.status(201).json({ ok:true, success:true, numero: data.numero, NUMERO: data.numero });
  } catch(e) {
    const dup = e.code === "P2002";
    if (!dup) logErr("POST tickets", e);
    r.status(dup?409:503).json({ error: dup ? `Ticket ${data.numero} existe deja.` : e.message });
  }
});

app.patch("/api/tickets/:numero", auth, async (req, r) => {
  const statut = req.body?.STATUT || req.body?.statut;
  if (!statut) return r.status(400).json({ error: "statut requis." });
  try {
    await prisma.tickets.update({ where:{ numero: req.params.numero }, data:{ statut } });
    r.json({ ok:true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.delete("/api/tickets/:numero", auth, async (req, r) => {
  try {
    await prisma.tickets.delete({ where:{ numero: req.params.numero } });
    r.json({ ok:true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
//  DEPARTS
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/departs", auth, async (req, r) => {
  try {
    const { date, statut } = req.query;
    const isAdmin = ["admin","gestionnaire"].includes(req.user.role);
    const where = {};
    if (!isAdmin) where.agence_id = req.user.agence;
    if (date)   where.date   = date;
    if (statut) where.statut = statut;
    const rows = await prisma.departs.findMany({
      where, orderBy:[{ date:"desc"}, { heure:"asc" }]
    });
    r.json(rows);
  } catch(e) { logErr("GET departs", e); r.status(503).json({ error: e.message }); }
});

app.post("/api/departs", auth, async (req, r) => {
  const b = req.body || {};
  const data = {
    id           : b.ID            || b.id,
    trajet       : b.TRAJET        || b.trajet,
    date         : b.DATE          || b.date,
    heure        : b.HEURE         || b.heure,
    car_id       : b.CAR_ID        || b.car_id        || "",
    car_matricule: b.CAR_MATRICULE || b.car_matricule  || "",
    chauffeur    : b.CHAUFFEUR     || b.chauffeur      || "",
    statut       : b.STATUT        || b.statut         || "ouvert",
    agence_id    : b.AGENCE_ID     || b.agence_id      || req.user.agence || "soubre",
  };
  if (!data.id || !data.trajet || !data.date || !data.heure)
    return r.status(400).json({ error: "id, trajet, date, heure requis." });
  try {
    await prisma.departs.create({ data });
    r.status(201).json({ ok:true, id: data.id });
  } catch(e) { logErr("POST departs", e); r.status(503).json({ error: e.message }); }
});

// ─── CLOTURE DEPART — route exacte de apiClient.ts ───────────────────────────
// API.CLOTURE = /api/departs/:departId/cloture
app.post("/api/departs/:departId/cloture", auth, async (req, r) => {
  const { departId } = req.params;
  if (!departId) return r.status(400).json({ error: "departId requis." });
  try {
    const existing = await prisma.departs.findUnique({ where:{ id: departId } });
    if (!existing) return r.status(404).json({ error: "Depart introuvable." });
    await prisma.departs.update({
      where: { id: departId },
      data:  { statut:"cloture", cloture_at: new Date() },
    });
    r.json({ ok:true, id: departId, message:"Depart cloture." });
  } catch(e) { logErr("CLOTURE", e); r.status(503).json({ error: e.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
//  UTILISATEURS
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/utilisateurs", auth, async (req, r) => {
  try {
    const isAdmin = ["admin","gestionnaire"].includes(req.user.role);
    const where   = isAdmin ? {} : { agence_id: req.user.agence };
    const rows    = await prisma.utilisateurs.findMany({ where, orderBy:{ login:"asc" } });
    r.json(rows.map(u => ({
      id: u.login, username: u.login, login: u.login, role: u.role,
      agencyId: u.agence_id, agence_id: u.agence_id,
      fullName: u.full_name, full_name: u.full_name,
      isActive: u.is_active,
    })));
  } catch(e) { logErr("GET utilisateurs", e); r.status(503).json({ error: e.message }); }
});

app.post("/api/utilisateurs", adminAuth, async (req, r) => {
  const b = req.body || {};
  const data = {
    login     : b.login     || b.username,
    password  : b.password,
    role      : b.role      || "vendeur",
    agence_id : b.agencyId  || b.agence_id || "soubre",
    full_name : b.fullName  || b.full_name,
    is_active : b.isActive !== false,
  };
  if (!data.login || !data.password || !data.full_name)
    return r.status(400).json({ error: "login, password, fullName requis." });
  try {
    // Hasher le mot de passe avant stockage
    data.password = await bcrypt.hash(data.password, 10);
    await prisma.utilisateurs.create({ data });
    r.status(201).json({ ok:true, login: data.login });
  } catch(e) {
    const dup = e.code === "P2002";
    r.status(dup?409:503).json({ error: dup ? `${data.login} existe deja.` : e.message });
  }
});

app.patch("/api/utilisateurs/:login", adminAuth, async (req, r) => {
  const b    = req.body || {};
  const data = {};
  if (b.password  !== undefined) data.password  = await bcrypt.hash(b.password, 10);
  if (b.role      !== undefined) data.role      = b.role;
  if (b.agencyId  !== undefined) data.agence_id = b.agencyId;
  if (b.fullName  !== undefined) data.full_name = b.fullName;
  if (b.full_name !== undefined) data.full_name = b.full_name;
  if (b.isActive  !== undefined) data.is_active = Boolean(b.isActive);
  if (!Object.keys(data).length) return r.status(400).json({ error: "Aucun champ a modifier." });
  try {
    await prisma.utilisateurs.update({ where:{ login: req.params.login }, data });
    r.json({ ok:true });
  } catch(e) { logErr("PATCH utilisateurs", e); r.status(503).json({ error: e.message }); }
});

app.delete("/api/utilisateurs/:login", adminAuth, async (req, r) => {
  if (req.params.login === "admin")
    return r.status(403).json({ error: "Impossible de supprimer admin." });
  try {
    await prisma.utilisateurs.delete({ where:{ login: req.params.login } });
    r.json({ ok:true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
//  AGENCES
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/agences", auth, async (_q, r) => {
  try {
    const rows = await prisma.agences.findMany({ where:{ is_active:true }, orderBy:{ nom:"asc" } });
    r.json(rows);
  } catch(e) { r.status(503).json({ error: e.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
//  DEPENSES (carburant, etc.)
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/depenses", auth, async (req, r) => {
  try {
    const { date } = req.query;
    const isAdmin  = ["admin","gestionnaire"].includes(req.user.role);
    const where    = {};
    if (!isAdmin) where.agence_id = req.user.agence;
    if (date)     where.date      = date;
    const rows = await prisma.depenses.findMany({ where, orderBy:{ created_at:"desc" } });
    r.json(rows);
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.post("/api/depenses", auth, async (req, r) => {
  const b = req.body || {};
  const data = {
    car_id       : b.carId        || b.car_id        || "",
    car_matricule: b.carMatricule || b.car_matricule  || "",
    date         : b.date         || new Date().toISOString().slice(0,10),
    heure        : b.heure        || "",
    montant      : Number(b.montant) || 0,
    description  : b.description  || "",
    trajet       : b.trajet       || "",
    chauffeur    : b.chauffeur    || "",
    car_serial   : b.carSerial    || b.car_serial || "",
    agence_id    : b.agencyId     || b.agence_id  || req.user.agence || "soubre",
  };
  try {
    const dep = await prisma.depenses.create({ data });
    r.status(201).json({ ok:true, id: dep.id });
  } catch(e) { logErr("POST depenses", e); r.status(503).json({ error: e.message }); }
});

// ─── RAPPORT JOURNALIER ───────────────────────────────────────────────────────
app.get("/api/rapports/journalier", auth, async (req, r) => {
  try {
    const d       = req.query.date || new Date().toISOString().slice(0,10);
    const isAdmin = ["admin","gestionnaire"].includes(req.user.role);
    const where   = { date: d, statut:"vendu" };
    if (!isAdmin) where.agence_id = req.user.agence;
    const rows = await prisma.tickets.groupBy({
      by:["trajet","heure","agence_id"], where,
      _count:{ numero:true }, _sum:{ montant:true },
      orderBy:{ heure:"asc" },
    });
    r.json({ date:d, lignes: rows.map(row => ({
      TRAJET: row.trajet, HEURE: row.heure, AGENCE_ID: row.agence_id,
      NB_TICKETS: row._count.numero, TOTAL: row._sum.montant || 0,
    }))});
  } catch(e) { r.status(503).json({ error: e.message }); }
});


// ═════════════════════════════════════════════════════════════════════════════
//  VOYAGES (trajets + prix)
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/voyages", auth, async (_q, r) => {
  try {
    const rows = await prisma.voyages.findMany({ orderBy: { trajet: "asc" } });
    r.json(rows);
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.post("/api/voyages", adminAuth, async (req, r) => {
  const { trajet, prix = 0 } = req.body || {};
  if (!trajet) return r.status(400).json({ error: "trajet requis." });
  try {
    const v = await prisma.voyages.create({ data: { trajet, prix: Number(prix) } });
    r.status(201).json({ ok: true, id: v.id });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.patch("/api/voyages/:id", adminAuth, async (req, r) => {
  const { trajet, prix } = req.body || {};
  const data = {};
  if (trajet !== undefined) data.trajet = trajet;
  if (prix   !== undefined) data.prix   = Number(prix);
  try {
    await prisma.voyages.update({ where: { id: Number(req.params.id) }, data });
    r.json({ ok: true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.delete("/api/voyages/:id", adminAuth, async (req, r) => {
  try {
    await prisma.voyages.delete({ where: { id: Number(req.params.id) } });
    r.json({ ok: true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
//  CHAUFFEURS
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/chauffeurs", auth, async (_q, r) => {
  try {
    r.json(await prisma.chauffeurs.findMany({ orderBy: { nom: "asc" } }));
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.post("/api/chauffeurs", adminAuth, async (req, r) => {
  const { id, nom, bus_id = "" } = req.body || {};
  if (!id || !nom) return r.status(400).json({ error: "id et nom requis." });
  try {
    await prisma.chauffeurs.create({ data: { id, nom, bus_id } });
    r.status(201).json({ ok: true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.patch("/api/chauffeurs/:id", adminAuth, async (req, r) => {
  const { nom, bus_id } = req.body || {};
  const data = {};
  if (nom !== undefined) data.nom = nom;
  if (bus_id !== undefined) data.bus_id = bus_id;
  if (!Object.keys(data).length) return r.status(400).json({ error: "Rien a modifier." });
  try {
    await prisma.chauffeurs.update({ where: { id: req.params.id }, data });
    r.json({ ok: true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.delete("/api/chauffeurs/:id", adminAuth, async (req, r) => {
  try {
    await prisma.chauffeurs.delete({ where: { id: req.params.id } });
    r.json({ ok: true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

// ─────────────────────────────────────────
//  VEHICULES
// ─────────────────────────────────────────
app.get("/api/vehicules", auth, async (_q, r) => {
  try { r.json(await prisma.vehicules.findMany({ where: { is_active: true }, orderBy: { marque: "asc" } })); }
  catch(e) { r.status(503).json({ error: e.message }); }
});

app.post("/api/vehicules", adminAuth, async (req, r) => {
  const { id, marque = "", modele = "", immatriculation = "", nb_places = 65, chauffeur_id = "", agence_id = "soubre" } = req.body || {};
  if (!id) return r.status(400).json({ error: "id requis." });
  try {
    await prisma.vehicules.create({ data: { id, marque, modele, immatriculation, nb_places: parseInt(nb_places) || 65, chauffeur_id, agence_id } });
    r.status(201).json({ ok: true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.patch("/api/vehicules/:id", adminAuth, async (req, r) => {
  const b = req.body || {};
  const data = {};
  ["marque","modele","immatriculation","chauffeur_id","agence_id"].forEach(k => { if (b[k] !== undefined) data[k] = b[k]; });
  if (b.nb_places !== undefined) data.nb_places = parseInt(b.nb_places) || 65;
  if (b.is_active !== undefined) data.is_active = !!b.is_active;
  if (!Object.keys(data).length) return r.status(400).json({ error: "Rien a modifier." });
  try {
    await prisma.vehicules.update({ where: { id: req.params.id }, data });
    r.json({ ok: true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.delete("/api/vehicules/:id", adminAuth, async (req, r) => {
  try {
    await prisma.vehicules.delete({ where: { id: req.params.id } });
    r.json({ ok: true });
  } catch(e) { r.status(503).json({ error: e.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
//  TRANSPORTS (vue combinée départs + tickets)
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/transports", auth, async (req, r) => {
  try {
    const { date } = req.query;
    const isAdmin  = ["admin","gestionnaire"].includes(req.user.role);
    const where    = {};
    if (!isAdmin) where.agence_id = req.user.agence;
    if (date)     where.date      = date;
    const departs = await prisma.departs.findMany({
      where, orderBy: [{ date: "desc" }, { heure: "asc" }]
    });
    const result = await Promise.all(departs.map(async d => {
      const agg = await prisma.tickets.aggregate({
        where: { trajet: d.trajet, date: d.date, heure: d.heure, agence_id: d.agence_id },
        _count: { numero: true },
        _sum:   { montant: true },
      });
      return { ...d, NB_TICKETS: agg._count.numero, TOTAL: agg._sum.montant || 0 };
    }));
    r.json(result);
  } catch(e) { logErr("GET transports", e); r.status(503).json({ error: e.message }); }
});

// ═════════════════════════════════════════════════════════════════════════════
//  STATS GLOBALES
// ═════════════════════════════════════════════════════════════════════════════

app.get("/api/stats", auth, async (req, r) => {
  try {
    const today    = new Date().toISOString().slice(0, 10);
    const isAdmin  = ["admin","gestionnaire"].includes(req.user.role);
    const where    = isAdmin ? {} : { agence_id: req.user.agence };

    const [totalTickets, ticketsAujourdhui, totalVentes, departsOuverts] = await Promise.all([
      prisma.tickets.count({ where }),
      prisma.tickets.count({ where: { ...where, date: today } }),
      prisma.tickets.aggregate({ where: { ...where, statut: "vendu" }, _sum: { montant: true } }),
      prisma.departs.count({ where: { ...where, statut: "ouvert" } }),
    ]);

    r.json({
      totalTickets,
      ticketsAujourdhui,
      totalVentes: totalVentes._sum.montant || 0,
      departsOuverts,
    });
  } catch(e) { r.status(503).json({ error: e.message }); }
});


// ═════════════════════════════════════════════════════════════════════════════
//  LICENCE — vérification côté client
// ═════════════════════════════════════════════════════════════════════════════

const { verifierCle } = require("./licence");

app.post("/api/licence/verify", async (req, r) => {
  const { cle } = req.body || {};
  if (!cle) return r.status(400).json({ error: "Clé requise." });
  try {
    const result = verifierCle(cle);
    r.json(result);
  } catch(e) { r.status(503).json({ error: e.message }); }
});

app.get("/api/licence/status", auth, async (req, r) => {
  try {
    const { verifierCle: vc } = require("./licence");
    const cle = req.headers["x-licence-key"] || req.query.cle;
    if (!cle) return r.json({ valide: false, message: "Aucune licence configurée." });
    r.json(vc(cle));
  } catch(e) { r.status(503).json({ error: e.message }); }
});

// ─── 404 + ERREURS ────────────────────────────────────────────────────────────
app.use((req, r) => r.status(404).json({ error:`${req.method} ${req.url} introuvable.` }));
// eslint-disable-next-line no-unused-vars
app.use((err, _q, r, _n) => { logErr("global", err); r.status(500).json({ error: err?.message }); });

// ─── START ────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("\n============================================");
  console.log(" A.I.T Transport API  v3.0 — MySQL+Prisma");
  console.log("============================================");
  console.log(` API    : http://192.168.100.100:${PORT}`);
  console.log(` DB     : MySQL localhost:3306 ait_transport`);
  console.log(` Statut : http://192.168.100.100:${PORT}/status`);
  console.log(` Health : http://192.168.100.100:${PORT}/api/health\n`);
});

process.on("uncaughtException",  e => logErr("uncaughtException", e));
process.on("unhandledRejection", e => logErr("unhandledRejection", e));
process.on("SIGTERM", () => server.close(() => prisma.$disconnect().then(() => process.exit(0))));
process.on("SIGINT",  () => server.close(() => prisma.$disconnect().then(() => process.exit(0))));
