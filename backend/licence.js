"use strict";
// ─────────────────────────────────────────────────────────────────────────────
//  A.I.T Transport — Système de Licence
//  Génération et vérification des clés de licence
//  Usage : node licence.js generate "Nom Client" "Ville"
//          node licence.js verify "CLE-XXXXXXXX-XXXXXXXX"
// ─────────────────────────────────────────────────────────────────────────────

const crypto = require("crypto");
const fs     = require("fs");
const path   = require("path");

const LICENCE_SECRET = "AIT_TRANSPORT_LICENCE_2026_SOUBRE_CI";
const LICENCE_FILE   = path.join(__dirname, "licences.json");

// Durées
const DUREES = {
  "1an":   365,
  "6mois": 182,
  "3mois": 91,
  "demo":  30,
};

// ─── GÉNÉRER UNE CLÉ ─────────────────────────────────────────────────────────
function genererCle(client, ville, duree = "1an") {
  const jours      = DUREES[duree] || 365;
  const debut      = new Date();
  const expiration = new Date(Date.now() + jours * 24 * 60 * 60 * 1000);

  const payload = {
    client,
    ville,
    debut  : debut.toISOString().slice(0, 10),
    expire : expiration.toISOString().slice(0, 10),
    duree,
  };

  // Signature HMAC
  const data = `${client}|${ville}|${payload.expire}|${LICENCE_SECRET}`;
  const sig  = crypto.createHmac("sha256", LICENCE_SECRET).update(data).digest("hex").slice(0, 16).toUpperCase();

  // Clé lisible : AIT-YYYYMMDD-XXXXXXXXXXXXXXXX
  const dateStr = expiration.toISOString().slice(0, 10).replace(/-/g, "");
  const cle     = `AIT-${dateStr}-${sig}`;

  payload.cle = cle;

  // Sauvegarder dans licences.json
  let licences = [];
  try { licences = JSON.parse(fs.readFileSync(LICENCE_FILE, "utf8")); } catch {}
  licences.push({ ...payload, createdAt: new Date().toISOString() });
  fs.writeFileSync(LICENCE_FILE, JSON.stringify(licences, null, 2));

  return { cle, payload };
}

// ─── VÉRIFIER UNE CLÉ ────────────────────────────────────────────────────────
function verifierCle(cle) {
  if (!cle || !cle.startsWith("AIT-")) {
    return { valide: false, message: "Clé invalide — format incorrect." };
  }

  // Chercher dans licences.json
  let licences = [];
  try { licences = JSON.parse(fs.readFileSync(LICENCE_FILE, "utf8")); } catch {
    return { valide: false, message: "Fichier de licences introuvable." };
  }

  const licence = licences.find(l => l.cle === cle);
  if (!licence) {
    return { valide: false, message: "Clé non reconnue. Contactez AIT Transport." };
  }

  const aujourd = new Date().toISOString().slice(0, 10);
  const expire  = licence.expire;
  const jrsRestants = Math.floor((new Date(expire) - new Date(aujourd)) / (1000 * 60 * 60 * 24));

  if (aujourd > expire) {
    return {
      valide    : false,
      expire    : true,
      message   : `Licence expirée le ${expire}. Contactez AIT Transport pour renouveler.`,
      client    : licence.client,
      ville     : licence.ville,
    };
  }

  return {
    valide        : true,
    client        : licence.client,
    ville         : licence.ville,
    expire        : expire,
    jrsRestants   : jrsRestants,
    alerte        : jrsRestants <= 30,
    message       : jrsRestants <= 30
      ? `Licence expire dans ${jrsRestants} jour(s). Renouvelez avant le ${expire}.`
      : `Licence valide jusqu'au ${expire}.`,
  };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
const [,, cmd, ...args] = process.argv;

if (cmd === "generate") {
  const [client = "Client", ville = "Soubre", duree = "1an"] = args;
  const { cle, payload } = genererCle(client, ville, duree);

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║   A.I.T Transport — Nouvelle Licence             ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log(`  Client    : ${payload.client}`);
  console.log(`  Ville     : ${payload.ville}`);
  console.log(`  Durée     : ${payload.duree}`);
  console.log(`  Début     : ${payload.debut}`);
  console.log(`  Expiration: ${payload.expire}`);
  console.log(`\n  CLÉ DE LICENCE :`);
  console.log(`  ${cle}`);
  console.log("\n  Message WhatsApp :");
  console.log("  ─────────────────────────────────────────────────");
  console.log(`  Bonjour ${payload.client},`);
  console.log(`  Voici votre licence AIT Transport (${payload.duree}) :`);
  console.log(`  ${cle}`);
  console.log(`  Valable jusqu'au : ${payload.expire}`);
  console.log(`  Saisissez cette clé dans l'application.`);
  console.log("  ─────────────────────────────────────────────────\n");

} else if (cmd === "verify") {
  const [cle] = args;
  const result = verifierCle(cle);
  console.log("\nRésultat vérification :", result);

} else if (cmd === "list") {
  let licences = [];
  try { licences = JSON.parse(fs.readFileSync(LICENCE_FILE, "utf8")); } catch {}
  const aujourd = new Date().toISOString().slice(0, 10);
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║   A.I.T Transport — Liste des Licences           ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
  licences.forEach((l, i) => {
    const statut = aujourd > l.expire ? "❌ EXPIRÉE" : "✅ ACTIVE";
    console.log(`${i+1}. ${l.client} (${l.ville}) — ${statut}`);
    console.log(`   Clé    : ${l.cle}`);
    console.log(`   Expire : ${l.expire}\n`);
  });

} else {
  console.log("\nUsage:");
  console.log("  node licence.js generate \"Nom Client\" \"Ville\" \"1an\"");
  console.log("  node licence.js generate \"Nom Client\" \"Ville\" \"6mois\"");
  console.log("  node licence.js generate \"Nom Client\" \"Ville\" \"demo\"");
  console.log("  node licence.js verify \"AIT-XXXXXXXX-XXXXXXXXXXXXXXXX\"");
  console.log("  node licence.js list\n");
}

module.exports = { genererCle, verifierCle };
