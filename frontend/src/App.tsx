import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, clearToken, getToken, login as loginApi, pingServer, API, cloturerDepart } from "./apiClient";
import "./style.css";
// ─── LOGO BASE64 (AIT — 200px JPEG, ~7KB) ──────────────────────────────────
const AIT_LOGO_B64 = "data:image/jpeg;base64,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";


// ─── TYPES ────────────────────────────────────────────────────────────────────

type FleetCar = { carId: string; carMatricule: string; carModel: string; capacite: number; };
type Agency = { id: string; name: string; guichetId: string; city: string; };
type AppUser = { id: string; username: string; password: string; role: "vendeur" | "gestionnaire"; agencyId: string; fullName: string; isActive: boolean; };
type CashDesk = { id: string; label: string; agencyId: string; sellerUserId?: string; canSell: boolean; canReserve: boolean; canPrintReserve: boolean; canCancelReserve: boolean; isActive: boolean; };
type Route = { id: number; depart: string; arrivee: string; prix: number; horaires: string[]; fleet: FleetCar[]; scheduleAssignments: Record<string, string>; daysOfWeek?: string[]; };
type TicketPayload = { trajet: string; date: string; heure: string; siege: number[]; nom: string; telephone: string; paiement: string; montant: number; statut: "vendu" | "reserve"; numero?: string; carId: string; carMatricule: string; carModel: string; carSerial?: string; };
type SavedTicket = TicketPayload & { numero: string; createdAt: string; synced?: boolean; syncError?: string; };
type Depense = { carMatricule: string; date: string; heure: string; montant: number; description: string; carId?: string; trajet?: string; chauffeur?: string; carSerial?: string; };
type DepartureMeta = { chauffeur: string; carMatricule: string; carId: string; trajet: string; heure: string; date: string; };
type DailyPdfArchive = { id: string; date: string; fileName: string; createdAt: string; ventesCount: number; ventesTotal: number; carburantTotal: number; };
type SyncResult = { success: boolean; numero?: string; message?: string; error?: string; raw?: string; };
type NavTab = "vente" | "gestion" | "rapports" | "admin";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const API_URL = "http://localhost:3001";

async function apiJson(path: string, options: RequestInit = {}) {
  const base = API_URL.replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const token =
    localStorage.getItem("ait_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("[apiJson] Aucun token trouvé dans localStorage — la requête partira sans Authorization.");
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const raw = await res.text();
  let data: any = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!res.ok) {
    const message =
      res.status === 401
        ? "Session expirée ou non autorisée — veuillez vous reconnecter."
        : res.status === 403
        ? "Accès refusé — droits insuffisants pour cette action."
        : typeof data === "object" && data && data.error
        ? data.error
        : raw || `Erreur HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

async function fetchEnterpriseUsersFromServer(agenceId?: string): Promise<AppUser[]> {
  const qs = agenceId ? `?agenceId=${encodeURIComponent(agenceId)}` : "";
  const data = await apiJson(`${API.UTILISATEURS}${qs}`);

  if (!Array.isArray(data)) return [];

  return data.map((u: any) => ({
    id: String(u.id || u.username || u.login || ""),
    username: String(u.username || u.login || ""),
    password: "",
    role: String(u.role || "vendeur") as any,
    agencyId: String(u.agencyId || u.agenceId || "soubre"),
    fullName: String(u.fullName || u.full_name || u.username || u.login || ""),
    isActive: u.isActive !== false,
  }));
}
 // ← Node.js Express (HFSQL reste sur port 4900)
const USE_REMOTE_API = true;
const LOCAL_TICKETS_KEY = "ait_local_tickets";
const DEPARTURE_SERIALS_KEY = "ait_departure_serials";
const DEPARTURE_META_KEY = "ait_departure_meta";
const DAILY_PDF_ARCHIVES_KEY = "ait_daily_pdf_archives";
const DAILY_LOCKS_KEY = "ait_daily_locks";
const CLOSED_DEPARTURES_KEY = "ait_closed_departures";
const ENTERPRISE_USERS_KEY = "ait_enterprise_users";
const CASH_DESKS_KEY = "ait_cash_desks";
const AGENCIES_KEY = "ait_agencies";
const ROUTES_KEY = "ait_routes";
const SELLABLE_SEATS_PER_CAR = 64;
const DEFAULT_GUICHET_ID = "POSTE-SOUBRE-01";
// Le mode admin local est protégé par une confirmation unique — aucun mot de passe en dur.

const AGENCIES: Agency[] = [
  { id: "soubre", name: "Agence Soubré", guichetId: "POSTE-SOUBRE-01", city: "Soubré" },
  { id: "abidjan", name: "Agence Abidjan", guichetId: "POSTE-ABJ-01", city: "Abidjan" },
  { id: "sanpedro", name: "Agence San Pedro", guichetId: "POSTE-SP-01", city: "San Pedro" },
];

// Comptes de démonstration — mots de passe vides car l'auth passe par HFSQL.
// Ces entrées ne servent QUE comme indicateurs de structure ; elles ne permettent
// pas de se connecter (le login réel passe par /api/login avec bcrypt côté serveur).
const DEFAULT_ENTERPRISE_USERS: AppUser[] = [];

const DEFAULT_CASH_DESKS: CashDesk[] = [
  { id: "desk-1", label: "Caisse 1", agencyId: "soubre", canSell: true, canReserve: true, canPrintReserve: true, canCancelReserve: true, isActive: true },
];

const soubreFleet: FleetCar[] = [
  { carId: "C2", carMatricule: "AB-5678-CI", carModel: "Mercedes Sprinter", capacite: 65 },
  { carId: "C5", carMatricule: "AB-8765-CI", carModel: "Toyota Coaster", capacite: 66 },
  { carId: "C8", carMatricule: "CD-5678-CI", carModel: "Hyundai County", capacite: 73 },
];

const soubreAssign: Record<string, string> = {
  "06:00": "C2", "10:00": "C5", "14:00": "C8", "21:30": "C2", "22:00": "C5",
};

const ROUTES: Route[] = [
  { id: 1, depart: "Abidjan", arrivee: "Soubré", prix: 7000, horaires: ["06:00","10:00","14:00","18:00"], fleet: [{ carId:"C1", carMatricule:"AB-1234-CI", carModel:"Hyundai Universe", capacite:65 },{ carId:"C4", carMatricule:"AB-4321-CI", carModel:"Yutong ZK", capacite:65 },{ carId:"C7", carMatricule:"AB-7777-CI", carModel:"Mercedes Tourismo", capacite:65 }], scheduleAssignments: { "06:00":"C1","10:00":"C4","14:00":"C7","18:00":"C1" } },
  { id: 2, depart: "Soubré", arrivee: "Abidjan", prix: 5000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 3, depart: "Soubré", arrivee: "San Pedro", prix: 5000, horaires: ["07:00","12:00","17:00"], fleet: [{ carId:"C9", carMatricule:"SP-1111-CI", carModel:"Toyota Coaster", capacite:65 }], scheduleAssignments: {"07:00":"C9","12:00":"C9","17:00":"C9"} },
  { id: 4, depart: "Soubré", arrivee: "Gagnoa", prix: 2000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 5, depart: "Soubré", arrivee: "Diégonéfla", prix: 3500, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 6, depart: "Soubré", arrivee: "Oumé", prix: 4000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 7, depart: "Soubré", arrivee: "Kokoumbo", prix: 4500, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 8, depart: "Soubré", arrivee: "Toumodi", prix: 5000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 9, depart: "Soubré", arrivee: "Dimbokro", prix: 6000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 10, depart: "Soubré", arrivee: "Bongouanou", prix: 8000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 11, depart: "Soubré", arrivee: "Kotobi", prix: 8000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 12, depart: "Soubré", arrivee: "Arrah", prix: 8500, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 13, depart: "Soubré", arrivee: "Bonoua", prix: 10000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 14, depart: "Soubré", arrivee: "Abengourou", prix: 10000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 15, depart: "Soubré", arrivee: "Apprompronou", prix: 10000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 16, depart: "Soubré", arrivee: "Agnibilékrou", prix: 11000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 17, depart: "Soubré", arrivee: "Tankessé", prix: 12000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 18, depart: "Soubré", arrivee: "Koun-Fao", prix: 12000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 19, depart: "Soubré", arrivee: "Kotogouada", prix: 12000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 20, depart: "Soubré", arrivee: "Tanda", prix: 12000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 21, depart: "Soubré", arrivee: "Gouméré", prix: 12000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 22, depart: "Soubré", arrivee: "Bondoukou", prix: 12000, horaires: ["06:00","10:00","14:00","21:30","22:00"], fleet: soubreFleet, scheduleAssignments: soubreAssign },
  { id: 23, depart: "Soubré", arrivee: "Burkina Faso", prix: 25000, horaires: ["05:00"], daysOfWeek: ["Lundi"], fleet: [{ carId:"C10", carMatricule:"BF-2222", carModel:"Iveco", capacite:65 }], scheduleAssignments: {"05:00":"C10"} },
  { id: 24, depart: "Soubré", arrivee: "Mali", prix: 35000, horaires: ["05:30"], daysOfWeek: ["Mercredi"], fleet: [{ carId:"C11", carMatricule:"ML-9999", carModel:"Neoplan", capacite:65 }], scheduleAssignments: {"05:30":"C11"} },
  { id: 25, depart: "Soubré", arrivee: "Bénin", prix: 30000, horaires: ["06:00"], daysOfWeek: ["Vendredi"], fleet: [{ carId:"C12", carMatricule:"BN-3333", carModel:"Mercedes", capacite:65 }], scheduleAssignments: {"06:00":"C12"} },
  { id: 26, depart: "Soubré", arrivee: "Togo", prix: 28000, horaires: ["06:30"], daysOfWeek: ["Dimanche"], fleet: [{ carId:"C13", carMatricule:"TG-4444", carModel:"Yutong", capacite:65 }], scheduleAssignments: {"06:30":"C13"} },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function todayIso(): string { return new Date().toISOString().split("T")[0]; }
function fmtFcfa(v: number): string { return `${new Intl.NumberFormat("fr-FR").format(Number.isFinite(v) ? v : 0)} FCFA`; }
function fmtDateFr(v: string): string { if (!v) return "--/--/----"; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("fr-FR"); }
function nextNumero(type: "V" | "R"): string {
  const key = type === "V" ? "ait_counter_vente" : "ait_counter_reservation";
  const n = Number(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(n));
  const rand = Math.floor(1 + Math.random() * 9);
  return `AIT-${type}-${String(n).padStart(5, "0")}-${rand}`;
}
function generateSecCode(): string { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

function getDepartureSerial(routeId: number, date: string, heure: string, _carId?: string): string {
  // Clé sans carId — le numéro de série est propre au départ (route+date+heure),
  // le car est une propriété modifiable du départ, pas une composante de sa clé primaire.
  const mapKey = `${routeId}__${date}__${heure}`;
  try {
    const raw = localStorage.getItem(DEPARTURE_SERIALS_KEY);
    const parsed = raw ? JSON.parse(raw) as Record<string, string> : {};
    if (parsed[mapKey]) return parsed[mapKey];
    let value = "";
    do { value = String(Math.floor(100 + Math.random() * 900)); } while (Object.values(parsed).includes(value));
    parsed[mapKey] = value;
    localStorage.setItem(DEPARTURE_SERIALS_KEY, JSON.stringify(parsed));
    return value;
  } catch { return String(Math.floor(100 + Math.random() * 900)); }
}

function readDepartureMeta(): Record<string, DepartureMeta> { try { const raw = localStorage.getItem(DEPARTURE_META_KEY); if (!raw) return {}; const p = JSON.parse(raw) as Record<string, DepartureMeta>; return p && typeof p === "object" ? p : {}; } catch { return {}; } }
function writeDepartureMeta(meta: Record<string, DepartureMeta>): void { localStorage.setItem(DEPARTURE_META_KEY, JSON.stringify(meta)); }
function saveDepartureMeta(key: string, value: DepartureMeta): void { const c = readDepartureMeta(); c[key] = value; writeDepartureMeta(c); }
function readDailyPdfArchives(): DailyPdfArchive[] { try { const raw = localStorage.getItem(DAILY_PDF_ARCHIVES_KEY); if (!raw) return []; const p = JSON.parse(raw) as DailyPdfArchive[]; return Array.isArray(p) ? p : []; } catch { return []; } }
function writeDailyPdfArchives(items: DailyPdfArchive[]): void { localStorage.setItem(DAILY_PDF_ARCHIVES_KEY, JSON.stringify(items)); }
function readDailyLocks(): string[] { try { const raw = localStorage.getItem(DAILY_LOCKS_KEY); if (!raw) return []; const p = JSON.parse(raw) as string[]; return Array.isArray(p) ? p : []; } catch { return []; } }
function writeDailyLocks(items: string[]): void { localStorage.setItem(DAILY_LOCKS_KEY, JSON.stringify(items)); }
function readClosedDepartures(): string[] { try { const raw = localStorage.getItem(CLOSED_DEPARTURES_KEY); if (!raw) return []; const p = JSON.parse(raw) as string[]; return Array.isArray(p) ? p : []; } catch { return []; } }
function writeClosedDepartures(items: string[]): void { localStorage.setItem(CLOSED_DEPARTURES_KEY, JSON.stringify(items)); }
function readEnterpriseUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(ENTERPRISE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(ENTERPRISE_USERS_KEY, JSON.stringify([]));
      return [];
    }

    const parsed = JSON.parse(raw) as AppUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function writeEnterpriseUsers(users: AppUser[]) {
  localStorage.setItem(ENTERPRISE_USERS_KEY, JSON.stringify(users));
}
function readCashDesks(): CashDesk[] { try { const raw = localStorage.getItem(CASH_DESKS_KEY); if (!raw) { localStorage.setItem(CASH_DESKS_KEY, JSON.stringify(DEFAULT_CASH_DESKS)); return DEFAULT_CASH_DESKS; } const p = JSON.parse(raw) as CashDesk[]; return Array.isArray(p) && p.length > 0 ? p : DEFAULT_CASH_DESKS; } catch { return DEFAULT_CASH_DESKS; } }
function writeCashDesks(items: CashDesk[]): void { localStorage.setItem(CASH_DESKS_KEY, JSON.stringify(items)); }
function readAgencies(): Agency[] { try { const raw = localStorage.getItem(AGENCIES_KEY); if (!raw) { localStorage.setItem(AGENCIES_KEY, JSON.stringify(AGENCIES)); return AGENCIES; } const p = JSON.parse(raw) as Agency[]; return Array.isArray(p) && p.length > 0 ? p : AGENCIES; } catch { return AGENCIES; } }
function writeAgencies(items: Agency[]): void { localStorage.setItem(AGENCIES_KEY, JSON.stringify(items)); }
function readRoutes(): Route[] { try { const raw = localStorage.getItem(ROUTES_KEY); if (!raw) { localStorage.setItem(ROUTES_KEY, JSON.stringify(ROUTES)); return ROUTES; } const p = JSON.parse(raw) as Route[]; return Array.isArray(p) && p.length > 0 ? p : ROUTES; } catch { return ROUTES; } }
function writeRoutes(items: Route[]): void { localStorage.setItem(ROUTES_KEY, JSON.stringify(items)); }
function readLocalTickets(): SavedTicket[] { try { const raw = localStorage.getItem(LOCAL_TICKETS_KEY); if (!raw) return []; const p = JSON.parse(raw) as SavedTicket[]; return Array.isArray(p) ? p : []; } catch { return []; } }
function writeLocalTickets(tickets: SavedTicket[]): void { localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(tickets)); }
function updateSyncState(numero: string, remote: boolean, errorMsg = ""): void { const tickets = readLocalTickets(); const idx = tickets.findIndex(t => t.numero === numero); if (idx === -1) return; tickets[idx] = { ...tickets[idx], synced: remote, syncError: remote ? "" : errorMsg }; writeLocalTickets(tickets); }
async function saveTicketLocally(data: TicketPayload): Promise<string> { const numero = data.numero || nextNumero(data.statut === "vendu" ? "V" : "R"); const tickets = readLocalTickets(); const idx = tickets.findIndex(t => t.numero === numero); const saved: SavedTicket = { ...data, numero, createdAt: new Date().toISOString(), synced: false, syncError: "" }; if (idx >= 0) tickets[idx] = { ...tickets[idx], ...saved }; else tickets.unshift(saved); writeLocalTickets(tickets); return numero; }

// ─── API SYNC ─────────────────────────────────────────────────────────────────

async function safeReadResponse(res: Response): Promise<{ json: Record<string, unknown> | null; text: string }> {
  const text = await res.text();
  if (!text.trim()) return { json: null, text };
  try { return { json: JSON.parse(text) as Record<string, unknown>, text }; } catch { return { json: null, text }; }
}

async function syncToServer(_action: string, payload: unknown): Promise<SyncResult> {
  if (!USE_REMOTE_API) return { success: false, message: "Mode local actif" };
  try {
    const res = await apiFetch(API.TICKETS, { method: "POST", body: JSON.stringify(payload) });
    const { json, text } = await safeReadResponse(res);
    if (!res.ok) return { success: false, message: `HTTP ${res.status}`, error: text.slice(0, 300), raw: text };
    if (!json) return { success: false, message: "Réponse invalide", error: text.slice(0, 300), raw: text };
    return { success: Boolean(json.success || json.ok), numero: typeof json.numero === "string" ? json.numero : undefined, message: typeof json.message === "string" ? json.message : undefined, error: typeof json.error === "string" ? json.error : undefined, raw: text };
  } catch (err) { const msg = err instanceof Error ? err.message : "Erreur inconnue"; return { success: false, message: msg, error: msg }; }
}

async function saveTicketToApi(data: TicketPayload): Promise<{ numero: string; remote: boolean; errorMsg?: string }> {
  if (!USE_REMOTE_API) return { numero: data.numero || "LOCAL", remote: false, errorMsg: "Mode local" };
  const numero = data.numero || nextNumero(data.statut === "vendu" ? "V" : "R");
  const seats = Array.isArray(data.siege) ? data.siege : [];
  if (seats.length === 0) return { numero, remote: false, errorMsg: "Aucun siège" };
  const result = await syncToServer("save_ticket", {
    numero,
    trajet: data.trajet,
    date: data.date,
    heure: data.heure,
    siege: seats,
    nom: data.nom,
    telephone: data.telephone,
    paiement: data.paiement,
    montant: data.montant,
    statut: data.statut,
    carId: data.carId,
    carMatricule: data.carMatricule,
    carModel: data.carModel,
    carSerial: data.carSerial || "",
    agence_id: (data as any).agencyId || "soubre",
  });
  if (!result.success) return { numero, remote: false, errorMsg: result.error || result.message || "Erreur sync" };
  return { numero, remote: true };
}

async function syncAllLocal(): Promise<{ synced: number; failed: number; skipped: number }> {
  if (!USE_REMOTE_API) return { synced: 0, failed: 0, skipped: readLocalTickets().length };
  const local = readLocalTickets(); let synced = 0, failed = 0, skipped = 0;
  for (const t of local) { if (t.synced) { skipped++; continue; } const r = await saveTicketToApi(t); if (r.remote) { updateSyncState(t.numero, true); synced++; } else { updateSyncState(t.numero, false, r.errorMsg || "Erreur"); failed++; } }
  return { synced, failed, skipped };
}

// ─── PRINT ────────────────────────────────────────────────────────────────────

async function printTickets(
  numero: string,
  route: Route,
  car: FleetCar,
  actualMatricule: string,
  carSerial: string,
  date: string,
  heure: string,
  seats: number[],
  total: number,
  statutLabel = "VENDU",
  chauffeur = ""
): Promise<void> {
  if (seats.length === 0) return;

  const unit = total / seats.length;
  const win = window.open("", "_blank", "width=430,height=900");
  if (!win) {
    alert("Pop-ups bloqués ! Veuillez autoriser les popups pour imprimer.");
    return;
  }

  const fDate = (d: string) => d.split("-").reverse().join("/");
  const fCfa = (v: number) => new Intl.NumberFormat("fr-FR").format(Math.round(v));
  const paymentLabel = statutLabel === "RÉSERVÉ" ? "EN ATTENTE" : "PAYÉ";
  const agenceLabel = route.depart === "Soubré" ? "Soubré → Abidjan" : `${route.depart} → ${route.arrivee}`;

  const allHtml = seats.map((seat, i) => {
    const ticketNum = seats.length > 1 ? `${numero}-${i + 1}` : numero;
    return `
      <section class="ticket-page">
        <header class="ticket-header">
          <div class="logo-box">
            <img src="${AIT_LOGO_B64}" class="ticket-logo" alt="AIT" />
          </div>
          <div class="company">ALINO L'IMPÉRIAL TRANSPORT</div>
          <div class="sigle">(A.I.T)</div>
        </header>

        <div class="line"></div>

        <div class="row"><span>N°</span><strong>${ticketNum}</strong></div>
        <div class="row"><span>Date</span><strong>${fDate(date)}</strong></div>
        <div class="row"><span>Passager</span><strong>Client comptoir</strong></div>

        <div class="line"></div>

        <div class="row"><span>Trajet</span><strong>${agenceLabel}</strong></div>
        <div class="row"><span>Heure</span><strong>${heure}</strong></div>
        <div class="row"><span>Car</span><strong>${car.carId} · ${actualMatricule || car.carMatricule}</strong></div>
        ${chauffeur ? `<div class="row"><span>Chauffeur</span><strong>${chauffeur}</strong></div>` : ""}
        <div class="row"><span>Siège</span><strong class="big-seat">${seat}</strong></div>

        <div class="line"></div>

        <div class="total">TOTAL : ${fCfa(unit)} FCFA</div>
        <div class="row"><span>Paiement</span><strong>${paymentLabel}</strong></div>

        <div class="line"></div>

        <div class="thanks">MERCI — BON VOYAGE</div>
        <div class="agency">A.I.T — SOUBRÉ</div>
        <div class="contact">Tél : 07 79 87 36 32</div>

        <div class="mentions">Tout ticket encaissé n'est plus remboursable.<br/>Conservez ce ticket jusqu'à destination.</div>

        <div class="cut">✂ ACCUEIL — CONTRÔLEUR — COMPTABILITÉ ✂</div>

        <section class="control-copy">
          <div class="control-title">COUPON CONTRÔLE</div>
          <div class="row"><span>N° billet</span><strong>${ticketNum}</strong></div>
          <div class="row"><span>Trajet</span><strong>${route.depart} → ${route.arrivee}</strong></div>
          <div class="row"><span>Heure / Siège</span><strong>${heure} · ${seat}</strong></div>
          <div class="row"><span>Montant</span><strong>${fCfa(unit)} FCFA</strong></div>
          <div class="row"><span>Paiement</span><strong>${paymentLabel}</strong></div>
          <div class="row"><span>Date</span><strong>${fDate(date)}</strong></div>
        </section>
      </section>`;
  }).join("");

  win.document.write(`
    <html>
      <head>
        <title>Ticket AIT 80mm</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            width: 80mm;
            background: #fff;
            color: #000;
            font-family: "Courier New", monospace;
          }
          .ticket-page {
            width: 80mm;
            padding: 4mm 5mm 8mm;
            page-break-after: always;
          }
          .ticket-header { text-align: center; }
          .logo-box {
            width: 28mm;
            margin: 0 auto 2mm;
            text-align: center;
          }
          .ticket-logo {
            width: 28mm;
            height: auto;
            display: block;
            margin: 0 auto;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .company { font-size: 12px; font-weight: 900; text-transform: uppercase; }
          .sigle { font-size: 11px; font-weight: 700; margin-top: 1mm; }
          .line { border-top: 1px dashed #000; margin: 3mm 0; }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 3mm;
            font-size: 11px;
            line-height: 1.35;
            margin: 1mm 0;
          }
          .row span { white-space: nowrap; }
          .row strong { text-align: right; }
          .big-seat { font-size: 18px; }
          .total {
            text-align: center;
            font-size: 15px;
            font-weight: 900;
            margin: 2mm 0;
          }
          .thanks, .agency, .control-title {
            text-align: center;
            font-weight: 900;
            font-size: 11px;
          }
          .agency { margin-top: 1mm; }
          .contact { text-align: center; font-size: 10px; font-weight: 700; margin-top: 1mm; }
          .mentions { text-align: center; font-size: 8px; font-style: italic; margin: 3mm 2mm 0; line-height: 1.3; }
          .cut {
            text-align: center;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 2mm 0;
            margin: 4mm 0 3mm;
            font-size: 8px;
          }
          .control-copy {
            border-top: 1px solid #000;
            padding-top: 2mm;
            font-size: 10px;
          }
          .control-copy .row { font-size: 9px; }
          @media print {
            .ticket-page:last-child { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        ${allHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() { window.close(); };
              setTimeout(function() { window.close(); }, 2000);
            }, 400);
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}
// ─── PRINT DEPARTURE CLOSURE — VERSION AMÉLIORÉE ─────────────────────────────
// À insérer dans App__3_.tsx juste après la fermeture de printTickets (ligne ~456),
// avant le commentaire // ─── SEAT GRID ───

function printDepartureClosure(
  route: Route,
  car: FleetCar,
  carMatricule: string,
  carSerial: string,
  date: string,
  heure: string,
  soldCount: number,
  soldAmount: number,
  remainingSeats: number,
  fuelExpense: number
): void {
  const printWindow = window.open("", "_blank", "width=440,height=980");
  if (!printWindow) { alert("Pop-ups bloqués ! Veuillez autoriser les popups pour imprimer."); return; }

  const now = new Date().toLocaleString("fr-FR");
  const trajet = `${route.depart} → ${route.arrivee}`;
  const totalSeats   = (car?.capacite ?? 65) - 1;
  const reservedCount = Math.max(totalSeats - soldCount - remainingSeats, 0);
  const netAVerser   = soldAmount - fuelExpense;
  const tauxRemplissage = Math.round((soldCount / totalSeats) * 100);
  const fmtN = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  const dateFormatted = (() => {
    try { return new Date(date).toLocaleDateString("fr-FR", { weekday:"long", year:"numeric", month:"long", day:"numeric" }); }
    catch { return date; }
  })();

  const css = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    @page{margin:0;size:80mm auto;}
    body{font-family:'Courier New',monospace;font-size:11px;line-height:1.5;color:#000;background:#fff;width:80mm;padding:4mm 4mm 8mm;}
    .center{text-align:center;}
    .bold{font-weight:bold;}
    .company{font-size:13px;font-weight:900;letter-spacing:1px;}
    .doc-title{font-size:14px;font-weight:900;margin:3px 0;letter-spacing:.5px;}
    .badge{border:1px solid #000;padding:1px 6px;font-size:8px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;display:inline-block;}
    .sep{border:none;border-top:1px dashed #000;margin:5px 0;}
    .sep-solid{border:none;border-top:2px solid #000;margin:5px 0;}
    .row{display:flex;justify-content:space-between;padding:2px 0;font-size:10.5px;}
    .row .lbl{font-weight:bold;}
    .row .val{text-align:right;}
    .section{font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:.5px;text-align:center;margin:5px 0 3px;}
    .highlight{background:#f0f0f0;padding:3px 5px;margin:2px -4px;}
    .net{font-size:14px;font-weight:900;border-top:2px solid #000;padding-top:5px;margin-top:3px;}
    .caisse-box{border:2px solid #000;padding:5px 8px;margin:8px 0;text-align:center;}
    .caisse-title{font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
    .caisse-montant{font-size:18px;font-weight:900;}
    .carb-box{border:1px dashed #000;padding:4px 6px;margin:6px 0;}
    .sig-row{display:flex;justify-content:space-between;margin-top:16px;gap:6px;}
    .sig-box{width:46%;text-align:center;font-size:8.5px;}
    .sig-line{border-bottom:1px solid #000;height:22px;margin-bottom:3px;}
    .cut{border-top:2px dashed #000;margin:10px 0;text-align:center;font-size:8px;letter-spacing:2px;padding-top:3px;}
    .footer{text-align:center;font-size:9px;color:#666;margin-top:8px;}
    .bar-bg{height:8px;background:#e0e0e0;width:100%;margin:3px 0;}
    .bar-fill{height:100%;background:#000;}
  `;

  const copyBlock = (label: string, showCarb: boolean) => `
  <div class="center">
    <div class="badge">${label}</div>
    <div class="company">A.I.T TRANSPORT</div>
    <div class="doc-title">BON DE CLOTURE</div>
    <div style="font-size:9px;color:#555">${now}</div>
  </div>
  <hr class="sep"/>
  <div class="row"><span class="lbl">Trajet</span><span class="val">${trajet}</span></div>
  <div class="row"><span class="lbl">Vehicule</span><span class="val">${car?.carId ? car.carId + ' ' + carMatricule : carMatricule}</span></div>
  <div class="row"><span class="lbl">Immatriculation</span><span class="val">${carMatricule}</span></div>
  <div class="row"><span class="lbl">Série</span><span class="val">${carSerial || "---"}</span></div>
  <div class="row"><span class="lbl">Date / Heure</span><span class="val">${dateFormatted} ${heure}</span></div>
  <hr class="sep"/>
  <div class="section">Bilan des sièges</div>
  <div class="row highlight"><span class="lbl">Tickets vendus</span><span class="val bold">${soldCount} / ${totalSeats}</span></div>
  <div class="row"><span class="lbl">Réservés</span><span class="val">${reservedCount}</span></div>
  <div class="row"><span class="lbl">Sièges libres</span><span class="val">${remainingSeats}</span></div>
  <div class="bar-bg"><div class="bar-fill" style="width:${tauxRemplissage}%"></div></div>
  <div style="text-align:right;font-size:9px">Taux : ${tauxRemplissage}%</div>
  <hr class="sep"/>
  <div class="section">Bilan financier</div>
  <div class="row"><span class="lbl">Recette brute</span><span class="val">${fmtN(soldAmount)} FCFA</span></div>
  ${showCarb && fuelExpense > 0 ? `
  <div class="carb-box">
    <div class="row"><span class="lbl">Carburant</span><span class="val">- ${fmtN(fuelExpense)} FCFA</span></div>
  </div>` : `
  <div class="carb-box">
    <div style="font-size:9px;text-align:center">Carburant : à saisir après clôture</div>
  </div>`}
  <div class="row net"><span>NET A VERSER</span><span>${fmtN(netAVerser)} FCFA</span></div>
  <hr class="sep"/>
  <div class="caisse-box">
    <div class="caisse-title">Montant à remettre en caisse intermédiaire</div>
    <div class="caisse-montant">${fmtN(soldAmount)} FCFA</div>
    <div style="font-size:9px;margin-top:3px">(Carburant à déduire après)</div>
  </div>
  <div class="sig-row">
    <div class="sig-box"><div class="sig-line"></div>Vendeur</div>
    <div class="sig-box"><div class="sig-line"></div>Gestionnaire</div>
  </div>
  `;

  printWindow.document.write(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/><title>Cloture AIT</title>
<style>${css}</style></head><body>
${copyBlock("VENDEUR", false)}
<div class="cut">✂ COUPER ICI ✂</div>
${copyBlock("GESTIONNAIRE", true)}
<div class="footer">AIT Transport · ${heure} · ${dateFormatted}</div>
</body></html>`);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
}


function printDailyClosure80mm(
  date: string,
  breakdown: { heure: string; trajet: string; carId: string; carMatricule: string; chauffeur: string; ticketsVendus: number; montantVendu: number; carburant: number }[],
  totalVentes: number,
  totalCarburant: number
): void {
  const printWindow = window.open("", "_blank", "width=440,height=1200");
  if (!printWindow) { alert("Pop-ups bloqués ! Veuillez autoriser les popups."); return; }

  const now = new Date().toLocaleString("fr-FR");
  const net = totalVentes - totalCarburant;
  const fmtN = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  const dateFormatted = (() => {
    try { return new Date(date).toLocaleDateString("fr-FR", { weekday:"long", year:"numeric", month:"long", day:"numeric" }); }
    catch { return date; }
  })();

  const rows = breakdown.map((d, i) => `
    <div class="depart-block">
      <div class="depart-header">${i+1}. ${d.heure} — ${d.trajet}</div>
      <div class="row"><span>Vehicule</span><span>${d.carId} · ${d.carMatricule}</span></div>
      <div class="row"><span>Chauffeur</span><span>${d.chauffeur || "—"}</span></div>
      <div class="row"><span>Tickets vendus</span><span class="bold">${d.ticketsVendus}</span></div>
      <div class="row"><span>Recette</span><span class="bold green">${fmtN(d.montantVendu)} FCFA</span></div>
      <div class="row"><span>Carburant</span><span class="red">- ${fmtN(d.carburant)} FCFA</span></div>
      <div class="row net-row"><span>Net</span><span>${fmtN(d.montantVendu - d.carburant)} FCFA</span></div>
    </div>`).join("");

  printWindow.document.write(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/>
<title>Cloture Journaliere AIT</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  @page{margin:0;size:80mm auto;}
  body{font-family:'Courier New',monospace;font-size:10.5px;line-height:1.5;color:#000;background:#fff;width:80mm;padding:4mm 4mm 8mm;}
  .center{text-align:center;}
  .company{font-size:13px;font-weight:900;letter-spacing:1px;}
  .doc-title{font-size:14px;font-weight:900;margin:3px 0;}
  .sep{border:none;border-top:1px dashed #000;margin:5px 0;}
  .sep-solid{border:none;border-top:2px solid #000;margin:5px 0;}
  .row{display:flex;justify-content:space-between;padding:1.5px 0;font-size:10px;}
  .bold{font-weight:bold;}
  .green{font-weight:bold;}
  .red{font-weight:bold;}
  .depart-block{border:1px solid #ccc;padding:4px 5px;margin:5px 0;border-radius:2px;}
  .depart-header{font-weight:900;font-size:10px;text-transform:uppercase;margin-bottom:3px;border-bottom:1px dashed #ccc;padding-bottom:2px;}
  .net-row{border-top:1px solid #ccc;margin-top:2px;padding-top:2px;font-weight:bold;}
  .section{font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:.5px;text-align:center;margin:6px 0 3px;}
  .total-box{border:2px solid #000;padding:6px 8px;margin:8px 0;text-align:center;}
  .total-label{font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;}
  .total-amount{font-size:18px;font-weight:900;margin:3px 0;}
  .sig-row{display:flex;justify-content:space-between;margin-top:16px;gap:6px;}
  .sig-box{width:46%;text-align:center;font-size:8.5px;}
  .sig-line{border-bottom:1px solid #000;height:22px;margin-bottom:3px;}
  .footer{text-align:center;font-size:9px;color:#666;margin-top:8px;}
</style>
</head><body>

<div class="center">
  <div class="company">A.I.T TRANSPORT</div>
  <div class="doc-title">BILAN JOURNALIER</div>
  <div style="font-size:10px;font-weight:bold">${dateFormatted}</div>
  <div style="font-size:9px;color:#555">Imprimé le ${now}</div>
</div>
<hr class="sep"/>

<div class="section">Détail des départs (${breakdown.length} véhicule(s))</div>
${rows}

<hr class="sep-solid"/>
<div class="section">Récapitulatif financier</div>
<div class="row"><span>Total recette brute</span><span class="bold">${fmtN(totalVentes)} FCFA</span></div>
<div class="row"><span>Total carburant</span><span class="bold">- ${fmtN(totalCarburant)} FCFA</span></div>
<hr class="sep"/>

<div class="total-box">
  <div class="total-label">Net à verser en caisse</div>
  <div class="total-amount">${fmtN(net)} FCFA</div>
  <div style="font-size:9px">${dateFormatted}</div>
</div>

<div class="sig-row">
  <div class="sig-box"><div class="sig-line"></div>Gestionnaire</div>
  <div class="sig-box"><div class="sig-line"></div>Caissier</div>
</div>

<div class="footer">AIT Transport · Clôture journalière · ${date}</div>
</body></html>`);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
}

function downloadDailyClosurePdf(
  date: string,
  ventes: SavedTicket[],
  carburant: Depense[],
  breakdown: { heure: string; trajet: string; carId: string; carMatricule: string; chauffeur: string; ticketsVendus: number; montantVendu: number; carburant: number }[]
): string {
  const fileName = `AIT-BILAN-${date}.pdf`;
  const totalVentes = ventes.reduce((s, v) => s + v.montant, 0);
  const totalCarb   = carburant.reduce((s, d) => s + d.montant, 0);
  const net         = totalVentes - totalCarb;
  const fmtD = (d: string) => { try { return new Date(d).toLocaleDateString("fr-FR", { weekday:"long", year:"numeric", month:"long", day:"numeric" }); } catch { return d; } };
  const fmtN = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  const rowsBreakdown = breakdown.map(d => `
    <tr>
      <td>${d.heure}</td>
      <td style="font-size:11px">${d.trajet}</td>
      <td>${d.carId} · ${d.carMatricule}</td>
      <td>${d.chauffeur || "—"}</td>
      <td><b>${d.ticketsVendus}</b></td>
      <td style="color:#155724"><b>${fmtN(d.montantVendu)} F</b></td>
      <td style="color:#721c24">${fmtN(d.carburant)} F</td>
    </tr>`).join("");

  const rowsVentes = ventes.slice(0, 50).map(t => `
    <tr>
      <td style="font-size:10px">${t.numero}</td>
      <td style="font-size:10px">${t.trajet}</td>
      <td>${t.heure}</td>
      <td>${t.siege.join(",")}</td>
      <td><b>${fmtN(t.montant)} F</b></td>
      <td>${t.paiement}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>${fileName}</title>
  <style>
    @page { margin: 10mm; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; }
    h1 { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 4px; }
    h2 { font-size: 13px; font-weight: bold; margin: 14px 0 6px; border-bottom: 1px solid #000; padding-bottom: 2px; }
    .subtitle { text-align: center; font-size: 11px; color: #444; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
    th { background: #1a1a1a; color: #fff; padding: 4px 6px; text-align: left; }
    td { padding: 3px 6px; border-bottom: 1px solid #ddd; }
    .totals { border: 1px solid #000; padding: 10px 14px; margin-bottom: 12px; }
    .total-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; }
    .total-row.net { font-size: 15px; font-weight: bold; border-top: 1px solid #000; padding-top: 6px; margin-top: 4px; }
    .green { color: #155724; } .red { color: #721c24; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>ALINO L'IMPÉRIAL TRANSPORT (A.I.T)</h1>
  <div class="subtitle">BILAN JOURNALIER — ${fmtD(date)}</div>
  <div class="subtitle">Imprimé le ${new Date().toLocaleString("fr-FR")}</div>

  <div class="totals">
    <div class="total-row"><span>Recettes brutes</span><span class="green"><b>${fmtN(totalVentes)} FCFA</b></span></div>
    <div class="total-row"><span>Dépenses carburant</span><span class="red">−${fmtN(totalCarb)} FCFA</span></div>
    <div class="total-row net"><span>NET À VERSER</span><span>${fmtN(net)} FCFA</span></div>
  </div>

  <h2>Récapitulatif par départ</h2>
  <table>
    <thead><tr><th>Heure</th><th>Trajet</th><th>Car</th><th>Chauffeur</th><th>Tickets</th><th>Recette</th><th>Carburant</th></tr></thead>
    <tbody>${rowsBreakdown || '<tr><td colspan="7" style="text-align:center;color:#888">Aucun départ ce jour.</td></tr>'}</tbody>
  </table>

  <h2>Détail des tickets vendus (${ventes.length})</h2>
  <table>
    <thead><tr><th>N° Ticket</th><th>Trajet</th><th>Heure</th><th>Siège(s)</th><th>Montant</th><th>Paiement</th></tr></thead>
    <tbody>${rowsVentes || '<tr><td colspan="6" style="text-align:center;color:#888">Aucun ticket.</td></tr>'}</tbody>
  </table>
  ${ventes.length > 50 ? `<p style="font-size:10px;color:#666">... et ${ventes.length - 50} ticket(s) supplémentaire(s) non affichés.</p>` : ""}

  <script>window.onload = function() { setTimeout(function() { window.print(); window.onafterprint = function() { window.close(); }; setTimeout(function() { window.close(); }, 3000); }, 500); };</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
  } else {
    // Fallback : téléchargement blob
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  }
  return fileName;
}

// ─── SEAT GRID ────────────────────────────────────────────────────────────────

function SeatGrid({ capacity, selected, sold, reserved, onToggle }: { capacity: number; selected: number[]; sold: number[]; reserved: number[]; onToggle: (s: number) => void; }) {
  // Layout bus 3+2 : 3 sieges | couloir | 2 sieges
  const renderSeat = (seat: number | "CH" | "empty", key: string) => {
    if (seat === "empty") return <div key={key} className="sg-empty" />;
    if (seat === "CH") return (
      <button key={key} type="button" disabled className="sg-seat sg-driver" title="Siege chauffeur">
        <span style={{ display: "block", fontSize: 10, lineHeight: 1 }}>1</span>
        <small style={{ fontSize: 7 }}>CH</small>
      </button>
    );
    const n = seat as number;
    const isSold = sold.includes(n), isReserved = reserved.includes(n), isSelected = selected.includes(n);
    const cls = "sg-seat " + (isSold ? "sg-sold" : isReserved ? "sg-reserved" : isSelected ? "sg-selected" : "sg-free");
    return (
      <button key={key} type="button" disabled={isSold || isReserved} onClick={() => onToggle(n)} className={cls} title={`Siege ${n}`}>
        {n}
      </button>
    );
  };
  const totalPassengerSeats = capacity;
  const totalRows = Math.ceil((totalPassengerSeats + 1) / 5);
  const seatAt = (row: number, col: number): number | "empty" | "CH" => {
    const globalIndex = row * 5 + col;
    if (globalIndex === 0) return "CH";
    const seatNumber = globalIndex + 1;
    return seatNumber <= totalPassengerSeats + 1 ? seatNumber : "empty";
  };
  const rows: React.ReactNode[] = [];
  for (let row = 0; row < totalRows; row++) {
    const leftSeats = [
      renderSeat(seatAt(row, 0) as any, `s-${row}-0`),
      renderSeat(seatAt(row, 1) as any, `s-${row}-1`),
      renderSeat(seatAt(row, 2) as any, `s-${row}-2`),
    ];
    const rightSeats = [
      renderSeat(seatAt(row, 3) as any, `s-${row}-3`),
      renderSeat(seatAt(row, 4) as any, `s-${row}-4`),
    ];
    rows.push(
      <div key={`row-${row}`} className="sg-row">
        <div className="sg-side sg-side-left">{leftSeats}</div>
        <div className="sg-aisle" />
        <div className="sg-side sg-side-right">{rightSeats}</div>
      </div>
    );
  }
  return <div className="sg-bus">{rows}</div>;
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────


// ═════════════════════════════════════════════════════════════════════════════
//  LICENCE GATE — Vérifie la licence avant tout accès
// ═════════════════════════════════════════════════════════════════════════════

const LICENCE_KEY_STORAGE = "ait_licence_key";

function LicenceGate({ children }: { children: React.ReactNode }) {
  const [cle, setCle]           = useState(() => localStorage.getItem(LICENCE_KEY_STORAGE) || "");
  const [input, setInput]       = useState("");
  const [status, setStatus]     = useState<"checking"|"valid"|"invalid"|"expired"|"none">("checking");
  const [info, setInfo]         = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Vérifier la licence au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(LICENCE_KEY_STORAGE);
    if (!stored) { setStatus("none"); return; }
    verifyLicence(stored);
  }, []); // eslint-disable-line

  async function verifyLicence(key: string) {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/licence/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cle: key }),
      });
      const data = await res.json();
      setInfo(data);
      if (data.valide) {
        localStorage.setItem(LICENCE_KEY_STORAGE, key);
        setCle(key);
        setStatus("valid");
      } else if (data.expire) {
        setStatus("expired");
      } else {
        setStatus("invalid");
        localStorage.removeItem(LICENCE_KEY_STORAGE);
      }
    } catch {
      // Si serveur pas encore démarré, on accepte quand même (mode local)
      if (cle || key) {
        setStatus("valid");
      } else {
        setStatus("none");
      }
    }
    setLoading(false);
  }

  async function handleSubmit() {
    const key = input.trim().toUpperCase();
    if (!key) { setError("Veuillez saisir votre clé de licence."); return; }
    if (!key.startsWith("AIT-")) { setError("Clé invalide — doit commencer par AIT-"); return; }
    setError("");
    await verifyLicence(key);
    if (status === "invalid") setError("Clé non reconnue. Contactez AIT Transport.");
  }

  // Licence valide → afficher l'application
  if (status === "valid") {
    return (
      <>
        {info?.alerte && (
          <div style={{
            position:"fixed", top:0, left:0, right:0, zIndex:9998,
            background:"#f59e0b", color:"#000", padding:"6px 16px",
            textAlign:"center", fontSize:"12px", fontWeight:700,
          }}>
            ⚠ {info.message}
          </div>
        )}
        {children}
      </>
    );
  }

  // Vérification en cours
  if (status === "checking") {
    return (
      <div style={{ position:"fixed", inset:0, background:"#0b1120", display:"flex", alignItems:"center", justifyContent:"center", color:"#e2e8f0", fontFamily:"sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🚌</div>
          <div style={{ color:"#f5c842", fontWeight:700 }}>A.I.T Transport</div>
          <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>Vérification de la licence...</div>
        </div>
      </div>
    );
  }

  // Pas de licence ou expirée ou invalide → page de saisie
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"linear-gradient(135deg,#071422 0%,#0d1f10 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Segoe UI',sans-serif",
    }}>
      <style>{`
        .lic-box{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(245,200,66,0.15);border-radius:16px;padding:44px 40px;width:100%;max-width:460px;box-shadow:0 30px 80px rgba(0,0,0,0.6);}
        .lic-logo{text-align:center;margin-bottom:10px;}
        .lic-logo img{width:90px;height:90px;border-radius:12px;object-fit:cover;border:2px solid rgba(245,200,66,0.2);}
        .lic-title{text-align:center;color:#f5c842;font-size:18px;font-weight:800;margin-bottom:3px;}
        .lic-sub{text-align:center;color:#2a4060;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-bottom:28px;}
        .lic-status{text-align:center;padding:12px;border-radius:8px;margin-bottom:20px;font-size:13px;font-weight:600;}
        .lic-expired{background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:#fca5a5;}
        .lic-none{background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);color:#7dd3fc;}
        .lic-label{display:block;color:#3a5a7a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
        .lic-input{width:100%;padding:14px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:9px;color:#e2e8f0;font-size:14px;outline:none;font-family:'Courier New',monospace;letter-spacing:1px;}
        .lic-input:focus{border-color:#f5c842;}
        .lic-input::placeholder{color:#1e3048;letter-spacing:0;font-family:sans-serif;}
        .lic-btn{width:100%;padding:14px;background:#f5c842;border:none;border-radius:9px;color:#071422;font-size:15px;font-weight:800;cursor:pointer;margin-top:10px;}
        .lic-btn:hover:not(:disabled){background:#fde047;}
        .lic-btn:disabled{opacity:.5;cursor:not-allowed;}
        .lic-error{background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:#fca5a5;border-radius:7px;padding:10px 13px;font-size:12px;margin-top:12px;}
        .lic-contact{text-align:center;color:#1e3048;font-size:11px;margin-top:20px;}
        .lic-contact a{color:#38bdf8;text-decoration:none;}
      `}</style>
      <div className="lic-box">
        <div className="lic-logo">
          <img src="/ait-logo.png" alt="AIT" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
        </div>
        <div className="lic-title">ALINO L'IMPÉRIAL TRANSPORT</div>
        <div className="lic-sub">Activation du logiciel</div>

        {status === "expired" && (
          <div className="lic-status lic-expired">
            🔒 Licence expirée le {info?.expire}<br/>
            Contactez AIT Transport pour renouveler.
          </div>
        )}
        {status === "none" && (
          <div className="lic-status lic-none">
            🔑 Saisissez votre clé de licence pour activer le logiciel.
          </div>
        )}
        {status === "invalid" && (
          <div className="lic-status lic-expired">
            ❌ Clé non reconnue. Vérifiez et réessayez.
          </div>
        )}

        <label className="lic-label">Clé de licence</label>
        <input
          className="lic-input"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="AIT-AAAAAAAA-BBBBBBBBBBBBBBBB"
          disabled={loading}
          autoFocus
        />

        <button className="lic-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Vérification..." : "Activer le logiciel"}
        </button>

        {error && <div className="lic-error">⚠ {error}</div>}

        <div className="lic-contact">
          Besoin d'une licence ? Contactez-nous sur WhatsApp<br/>
          <strong style={{color:"#f5c842"}}>A.I.T Transport · Soubré, Côte d'Ivoire</strong>
        </div>
      </div>
    </div>
  );
}

function LoginModal({ onLogin, agencies }: { onClose: () => void; onLogin: (user: AppUser) => void; agencies: Agency[]; }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agencyId, setAgencyId] = useState(agencies[0]?.id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError("Identifiant et mot de passe requis."); return; }
    setLoading(true); setError("");
    try {
      const data = await loginApi(username.trim(), password.trim()) as any;
      if (!data.token || !data.user) { setError(data.error || "Identifiants incorrects."); setLoading(false); return; }
      localStorage.setItem("ait_token", data.token);
      const dbUser: AppUser = {
        id: data.user.id, username: data.user.username, password: "",
        role: (data.user.role as "vendeur" | "gestionnaire") || "vendeur",
        agencyId: data.user.agencyId || agencyId,
        fullName: data.user.fullName || data.user.username, isActive: true,
      };
      onLogin(dbUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("fetch") || msg.includes("network") || msg.includes("Failed")
        ? "Impossible de joindre le serveur. Vérifiez que le backend tourne."
        : msg || "Erreur de connexion.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"linear-gradient(135deg,#071422 0%,#0d2010 60%,#0a1a05 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Segoe UI',sans-serif",
    }}>
      <style>{`
        .lc{background:rgba(255,255,255,0.04);backdrop-filter:blur(24px);border:1px solid rgba(245,200,66,0.15);border-radius:18px;padding:50px 42px;width:100%;max-width:420px;box-shadow:0 30px 80px rgba(0,0,0,0.6);}
        .lc-logo{text-align:center;margin-bottom:12px;}
        .lc-logo img{width:100px;height:100px;border-radius:14px;object-fit:cover;border:2px solid rgba(245,200,66,0.25);box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .lc-title{text-align:center;color:#f5c842;font-size:18px;font-weight:800;letter-spacing:1px;margin-bottom:3px;}
        .lc-sub{text-align:center;color:#3a5a7a;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-bottom:36px;}
        .lc-group{margin-bottom:18px;}
        .lc-group label{display:block;color:#5a7a9a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
        .lc-input-wrap{position:relative;}
        .lc-input-wrap i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#3a5a7a;font-size:14px;}
        .lc-input-wrap .eye{left:auto;right:14px;cursor:pointer;}
        .lc-input{width:100%;padding:13px 42px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#e2e8f0;font-size:14px;outline:none;transition:border-color .2s,background .2s;}
        .lc-input:focus{border-color:#f5c842;background:rgba(255,255,255,0.1);}
        .lc-input::placeholder{color:#2a4060;}
        .lc-select{width:100%;padding:13px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#e2e8f0;font-size:14px;outline:none;}
        .lc-select option{background:#0d1f2d;}
        .lc-btn{width:100%;padding:15px;background:#f5c842;border:none;border-radius:9px;color:#071422;font-size:15px;font-weight:800;cursor:pointer;transition:all .2s;letter-spacing:.5px;margin-top:8px;}
        .lc-btn:hover:not(:disabled){background:#fde047;box-shadow:0 8px 24px rgba(245,200,66,0.35);transform:translateY(-1px);}
        .lc-btn:disabled{opacity:.5;cursor:not-allowed;}
        .lc-error{background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:#fca5a5;border-radius:8px;padding:11px 14px;font-size:12px;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
        .lc-footer{text-align:center;color:#1e3048;font-size:11px;margin-top:24px;}
        .lc-divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:20px 0 16px;}
      `}</style>
      <div className="lc">
        <div className="lc-logo">
          <img src="/ait-logo.png" alt="AIT" onError={e => {(e.target as HTMLImageElement).style.display='none';}} />
        </div>
        <div className="lc-title">ALINO L'IMPÉRIAL TRANSPORT</div>
        <div className="lc-sub">Système de gestion — Authentification</div>

        {error && <div className="lc-error">⚠ {error}</div>}

        <div className="lc-group">
          <label>Agence</label>
          <select className="lc-select" value={agencyId} onChange={e => setAgencyId(e.target.value)}>
            {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="lc-group">
          <label>Identifiant</label>
          <div className="lc-input-wrap">
            <i className="fa-solid fa-user" />
            <input
              className="lc-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Entrez votre login"
              autoFocus
              disabled={loading}
            />
          </div>
        </div>

        <div className="lc-group">
          <label>Mot de passe</label>
          <div className="lc-input-wrap">
            <i className="fa-solid fa-lock" />
            <input
              className="lc-input"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              disabled={loading}
              style={{paddingRight:42}}
            />
            <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"} eye`} onClick={() => setShowPwd(p => !p)} />
          </div>
        </div>

        <button className="lc-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Connexion en cours..." : "Se connecter"}
        </button>

        <hr className="lc-divider" />
        <div className="lc-footer">AIT Transport · Soubré, Côte d'Ivoire · v3.0</div>
      </div>
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [agencies, setAgencies] = useState<Agency[]>(readAgencies());
  const [routes, setRoutes] = useState<Route[]>(readRoutes());
  const [enterpriseUsers, setEnterpriseUsers] = useState<AppUser[]>([]);
  
  // Chargement des utilisateurs HFSQL — uniquement si connecté (token présent)
  // Évite les 401 au montage initial avant connexion.
  useEffect(() => {
    if (!getToken()) return; // pas de token = pas connecté, on n'appelle pas l'API
    let cancelled = false;

    async function loadEnterpriseUsersFromServer() {
      try {
        const users = await fetchEnterpriseUsersFromServer();
        if (!cancelled) {
          setEnterpriseUsers(users);
          writeEnterpriseUsers(users);
        }
      } catch {
        // Si le backend est indisponible, on garde le cache local.
      }
    }

    loadEnterpriseUsersFromServer();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
const [cashDesks, setCashDesks] = useState<CashDesk[]>(readCashDesks);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Recharger les utilisateurs HFSQL après connexion réussie
  useEffect(() => {
    if (!currentUser) return;
    fetchEnterpriseUsersFromServer()
      .then(users => { setEnterpriseUsers(users); writeEnterpriseUsers(users); })
      .catch(() => { /* backend indisponible — cache local conservé */ });
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("ait_is_admin") === "1");
  const [showLoginModal, setShowLoginModal] = useState(!getToken());
  // Bloquer tout accès si pas connecté
  if (!currentUser && !getToken() && !showLoginModal) {
    return null;
  }
  const [activeTab, setActiveTab] = useState<NavTab>("vente");

  // Trip
  const [selectedAgencyId, setSelectedAgencyId] = useState(AGENCIES[0].id);
  const [selectedCashDeskId, setSelectedCashDeskId] = useState("desk-1");
  const [selectedRouteId, setSelectedRouteId] = useState(ROUTES[0].id);
  const [travelDate, setTravelDate] = useState(todayIso);
  const [travelTime, setTravelTime] = useState(ROUTES[0].horaires[0]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [chauffeursList, setChauffeursList] = useState<{id:string;nom:string;bus_id:string}[]>([]);
  useEffect(() => { apiJson("/api/chauffeurs").then((d:any)=>setChauffeursList(Array.isArray(d)?d:[])).catch(()=>{}); }, []);
  const [vehiculesList, setVehiculesList] = useState<{id:string;marque:string;modele:string;immatriculation:string;nb_places:number;chauffeur_id:string}[]>([]);
  useEffect(() => { apiJson("/api/vehicules").then((d:any)=>setVehiculesList(Array.isArray(d)?d:[])).catch(()=>{}); }, []);
  const [actualVehicleMatricule, setActualVehicleMatricule] = useState("");
  const [driverName, setDriverName] = useState("");

  // Vente forms
  const [mode, setMode] = useState<"vente" | "reservation">("vente");
  const [paymentMethod, setPaymentMethod] = useState("Espèces");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [resNom, setResNom] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resPayment, setResPayment] = useState("Espèces");

  // Data
  const [tickets, setTickets] = useState<SavedTicket[]>([]);
  const [closedKeys, setClosedKeys] = useState<string[]>(readClosedDepartures());
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [depenseMontant, setDepenseMontant] = useState(0);
  const [depenseDescription, setDepenseDescription] = useState("Carburant");
  const [depenseMatricule, setDepenseMatricule] = useState("");
  const [fuelThreshold, setFuelThreshold] = useState<number>(() => Number(localStorage.getItem("ait_fuel_threshold") || "0"));
  const [lastNumero, setLastNumero] = useState("—");
  const [connStatus, setConnStatus] = useState<"idle"|"online"|"offline">("idle");
  const [syncState, setSyncState] = useState<{ synced:number; failed:number; skipped:number } | null>(null);
  const [filterDate, setFilterDate] = useState(todayIso);
  const [searchStartDate, setSearchStartDate] = useState(todayIso);
  const [searchEndDate, setSearchEndDate] = useState(todayIso);
  const [searchDriver, setSearchDriver] = useState("");
  const [searchMatricule, setSearchMatricule] = useState("");
  const [searchDepartureOrder, setSearchDepartureOrder] = useState("tous");
  const [selectedSearchDepartureKey, setSelectedSearchDepartureKey] = useState("");
  const [toast, setToast] = useState<{ msg:string; type:string } | null>(null);
  const [dailyPdfArchives, setDailyPdfArchives] = useState<DailyPdfArchive[]>([]);
  const [dailyLocks, setDailyLocks] = useState<string[]>([]);

  // Admin edit states
  const [adminAgencyName, setAdminAgencyName] = useState("");
  const [adminAgencyCity, setAdminAgencyCity] = useState("");
  const [adminDepart, setAdminDepart] = useState("");
  const [adminArrivee, setAdminArrivee] = useState("");
  const [adminPrix, setAdminPrix] = useState(0);
  const [adminHoraires, setAdminHoraires] = useState("");
  const [newRouteDepart, setNewRouteDepart] = useState("");
  const [newRouteArrivee, setNewRouteArrivee] = useState("");
  const [newRoutePrix, setNewRoutePrix] = useState(0);
  const [newRouteHoraires, setNewRouteHoraires] = useState("");
  const [newCashDeskLabel, setNewCashDeskLabel] = useState("");
  const [deskCanSell, setDeskCanSell] = useState(true);
  const [deskCanReserve, setDeskCanReserve] = useState(true);
  const [deskCanPrintReserve, setDeskCanPrintReserve] = useState(true);
  const [deskCanCancelReserve, setDeskCanCancelReserve] = useState(true);
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"vendeur" | "gestionnaire">("vendeur");
  const [newUserAgencyId, setNewUserAgencyId] = useState(AGENCIES[0].id);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<AppUser>>({});
  // Admin: new agency form
  const [newAgencyName, setNewAgencyName] = useState("");
  const [newAgencyCity, setNewAgencyCity] = useState("");
  const [newAgencyGuichet, setNewAgencyGuichet] = useState("");

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  useEffect(() => { setTickets(readLocalTickets()); }, []);
  useEffect(() => { setDailyPdfArchives(readDailyPdfArchives()); }, []);
  useEffect(() => { setDailyLocks(readDailyLocks()); }, []);
  useEffect(() => { setClosedKeys(readClosedDepartures()); }, []);

  // Ping serveur toutes les 30 secondes pour maintenir le badge de connectivité
  useEffect(() => {
    let active = true;
    const check = async () => {
      const online = await pingServer();
      if (active) setConnStatus(online ? "online" : "offline");
    };
    check(); // vérification immédiate au montage
    const interval = setInterval(check, 30_000);
    return () => { active = false; clearInterval(interval); };
  }, []);
  useEffect(() => { setCashDesks(readCashDesks()); }, []);
  useEffect(() => { setAgencies(readAgencies()); }, []);
  useEffect(() => { setRoutes(readRoutes()); }, []);
  useEffect(() => { writeAgencies(agencies); }, [agencies]);
  useEffect(() => { writeRoutes(routes); }, [routes]);
  useEffect(() => { writeCashDesks(cashDesks); }, [cashDesks]);

  // Derived
  const selectedAgency = useMemo(() => agencies.find(a => a.id === selectedAgencyId) ?? agencies[0] ?? AGENCIES[0], [agencies, selectedAgencyId]);
  const agencyCashDesks = useMemo(() => cashDesks.filter(c => c.agencyId === selectedAgencyId), [cashDesks, selectedAgencyId]);
  const selectedCashDesk = useMemo(() => agencyCashDesks.find(c => c.id === selectedCashDeskId) ?? agencyCashDesks[0] ?? null, [agencyCashDesks, selectedCashDeskId]);
  const sellerCanSell = !!selectedCashDesk?.canSell;
  const sellerCanReserve = !!selectedCashDesk?.canReserve;
  const sellerCanPrintReserve = !!selectedCashDesk?.canPrintReserve;
  const sellerCanCancelReserve = !!selectedCashDesk?.canCancelReserve;
  const selectedRoute = useMemo(() => routes.find(r => r.id === selectedRouteId) ?? routes[0] ?? ROUTES[0], [routes, selectedRouteId]);
  // isAdmin = role "admin" OU mode admin activé manuellement (gestionnaire)
  const isAdminRole = (currentUser?.role as string) === "admin";
  // Met à jour isAdmin automatiquement si le rôle est admin
  useEffect(() => {
    if (isAdminRole) {
      setIsAdmin(true);
      localStorage.setItem("ait_is_admin", "1");
    }
  }, [isAdminRole]); // eslint-disable-line
  const isManager = currentUser?.role === "gestionnaire" || isAdminRole;
  const isSeller = currentUser?.role === "vendeur";
  const userRole = currentUser?.role ?? null;
  const agencyUsers = useMemo(() => enterpriseUsers.filter(u => u.agencyId === selectedAgencyId), [enterpriseUsers, selectedAgencyId]);

  useEffect(() => { if (!selectedAgency) return; setAdminAgencyName(selectedAgency.name); setAdminAgencyCity(selectedAgency.city); }, [selectedAgency]);
  useEffect(() => { if (!selectedRoute) return; setAdminDepart(selectedRoute.depart); setAdminArrivee(selectedRoute.arrivee); setAdminPrix(selectedRoute.prix); setAdminHoraires((selectedRoute.horaires || []).join(", ")); }, [selectedRoute]);
  useEffect(() => { const first = selectedRoute.horaires[0] ?? "06:00"; if (!selectedRoute.horaires.includes(travelTime)) setTravelTime(first); setSelectedSeats([]); }, [selectedRouteId]); // eslint-disable-line
  useEffect(() => { if (!agencyCashDesks.length) return; if (!agencyCashDesks.some(c => c.id === selectedCashDeskId)) setSelectedCashDeskId(agencyCashDesks[0].id); }, [agencyCashDesks, selectedCashDeskId]);
  useEffect(() => { if (!selectedCashDesk) return; setDeskCanSell(selectedCashDesk.canSell); setDeskCanReserve(selectedCashDesk.canReserve); setDeskCanPrintReserve(selectedCashDesk.canPrintReserve); setDeskCanCancelReserve(selectedCashDesk.canCancelReserve); }, [selectedCashDesk]);

  const dbFleet: FleetCar[] = useMemo(() => vehiculesList.map(v => ({ carId: v.id, carMatricule: v.immatriculation, carModel: (v.marque + " " + v.modele).trim() || v.immatriculation, capacite: (v.nb_places || 65) + 1 })), [vehiculesList]);
  const activeFleet = dbFleet.length ? dbFleet : selectedRoute.fleet;
  const plannedCarId = useMemo(() => selectedRoute.scheduleAssignments[travelTime] || activeFleet[0]?.carId || "", [selectedRoute, travelTime, activeFleet]);

  useEffect(() => {
    setSelectedCarId(plannedCarId);
    const plannedCar = activeFleet.find(c => c.carId === plannedCarId) ?? activeFleet[0];
    const nextKey = `${selectedRoute.id}__${travelDate}__${travelTime}`;
    const meta = readDepartureMeta()[nextKey];
    setActualVehicleMatricule(meta?.carMatricule || plannedCar?.carMatricule || "");
    setDriverName(meta?.chauffeur || "");
  }, [plannedCarId, selectedRoute, travelDate, travelTime]);

  const activeCar = useMemo(() => activeFleet.find(c => c.carId === selectedCarId) ?? activeFleet[0], [activeFleet, selectedCarId]);
  // Clé sans carId : un départ est identifié par route+date+heure uniquement
  const departureKey = `${selectedRoute.id}__${travelDate}__${travelTime}`;
  const isClosed = closedKeys.includes(departureKey);
  const isDayLocked = dailyLocks.includes(travelDate);
  // Capacité dynamique depuis la flotte — le siège 1 est réservé au chauffeur
  const sellableCapacity = Math.max((activeCar?.capacite ?? 65) - 1, 0);

  useEffect(() => {
    if (!activeCar?.carId) return;
    saveDepartureMeta(departureKey, { chauffeur: driverName.trim(), carMatricule: actualVehicleMatricule.trim() || activeCar.carMatricule, carId: activeCar.carId, trajet: `${selectedRoute.depart} → ${selectedRoute.arrivee}`, heure: travelTime, date: travelDate });
  }, [departureKey, driverName, actualVehicleMatricule, activeCar, selectedRoute, travelTime, travelDate]);

  const routeTickets = useMemo(() => tickets.filter(t => t.trajet === `${selectedRoute.depart} → ${selectedRoute.arrivee}` && t.date === travelDate && t.heure === travelTime && t.carId === activeCar?.carId), [tickets, selectedRoute, travelDate, travelTime, activeCar]);
  const soldSeats = useMemo(() => routeTickets.filter(t => t.statut === "vendu").flatMap(t => t.siege), [routeTickets]);
  const reservedSeats = useMemo(() => routeTickets.filter(t => t.statut === "reserve").flatMap(t => t.siege), [routeTickets]);
  const hasStartedSales = routeTickets.length > 0;
  const currentVehicleMatricule = actualVehicleMatricule.trim() || activeCar?.carMatricule || "";
  const activeCarSerial = useMemo(() => getDepartureSerial(selectedRoute.id, travelDate, travelTime, activeCar?.carId || ""), [selectedRoute.id, travelDate, travelTime, activeCar]);
  const toggleSeat = useCallback((seat: number) => { if (seat > sellableCapacity) return; if (soldSeats.includes(seat) || reservedSeats.includes(seat)) return; setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]); }, [sellableCapacity, soldSeats, reservedSeats]);
  const totalAmount = useMemo(() => selectedRoute.prix * Math.max(selectedSeats.length, 0), [selectedRoute.prix, selectedSeats.length]);
  const activeDepenses = useMemo(() => depenses.filter(d => d.carMatricule === currentVehicleMatricule && d.date === travelDate && d.heure === travelTime), [depenses, currentVehicleMatricule, travelDate, travelTime]);
  const carburantAvantDepart = useMemo(() => activeDepenses.filter(d => (d.description || "").toLowerCase().includes("carburant")).reduce((s, d) => s + d.montant, 0), [activeDepenses]);
  const isFuelExceeded = fuelThreshold > 0 && carburantAvantDepart > fuelThreshold;
  const saveFuelThreshold = (v: number) => { setFuelThreshold(v); localStorage.setItem("ait_fuel_threshold", String(v)); };
  const filteredTickets = useMemo(() => filterDate ? tickets.filter(t => t.date === filterDate) : tickets, [tickets, filterDate]);
  const ventesDuJour = useMemo(() => tickets.filter(t => t.date === travelDate && t.statut === "vendu"), [tickets, travelDate]);
  const reservesDuJour = useMemo(() => tickets.filter(t => t.date === travelDate && t.statut === "reserve"), [tickets, travelDate]);
  const totalVentes = useMemo(() => ventesDuJour.reduce((s, t) => s + t.montant, 0), [ventesDuJour]);
  const totalDepDuJour = useMemo(() => depenses.filter(d => d.date === travelDate).reduce((s, d) => s + d.montant, 0), [depenses, travelDate]);
  const benefice = totalVentes - totalDepDuJour;
  const cashEspeces = useMemo(() => ventesDuJour.filter(t => t.paiement === "Espèces").reduce((s, t) => s + t.montant, 0), [ventesDuJour]);
  const cashOrange = useMemo(() => ventesDuJour.filter(t => t.paiement === "Orange Money").reduce((s, t) => s + t.montant, 0), [ventesDuJour]);
  const cashWave = useMemo(() => ventesDuJour.filter(t => t.paiement === "Wave Money").reduce((s, t) => s + t.montant, 0), [ventesDuJour]);
  const ventesDuMois = useMemo(() => tickets.filter(t => t.date.startsWith(travelDate.slice(0, 7)) && t.statut === "vendu"), [tickets, travelDate]);
  const totalMois = useMemo(() => ventesDuMois.reduce((s, t) => s + t.montant, 0), [ventesDuMois]);
  const depensesMois = useMemo(() => depenses.filter(d => d.date.startsWith(travelDate.slice(0, 7))), [depenses, travelDate]);
  const totalDepensesMois = useMemo(() => depensesMois.reduce((s, d) => s + d.montant, 0), [depensesMois]);

  const departureSummaries = useMemo(() => {
    const metaMap = readDepartureMeta();
    const groups = new Map<string, { key:string; date:string; heure:string; trajet:string; carId:string; carMatricule:string; carSerial:string; chauffeur:string; soldCount:number; reservedCount:number; soldAmount:number; seats:number[] }>();
    tickets.forEach(t => {
      const key = `${t.date}__${t.heure}__${t.trajet}__${t.carId}__${t.carMatricule}`;
      const metaKeyGuess = Object.keys(metaMap).find(k => k.includes(`__${t.date}__${t.heure}__${t.carId}`));
      const meta = metaKeyGuess ? metaMap[metaKeyGuess] : undefined;
      if (!groups.has(key)) groups.set(key, { key, date:t.date, heure:t.heure, trajet:t.trajet, carId:t.carId, carMatricule:t.carMatricule, carSerial:t.carSerial||"---", chauffeur:meta?.chauffeur||"", soldCount:0, reservedCount:0, soldAmount:0, seats:[] });
      const item = groups.get(key)!;
      if (t.statut === "vendu") { item.soldCount += t.siege.length; item.soldAmount += t.montant; } else item.reservedCount += t.siege.length;
      item.seats.push(...t.siege);
      if (!item.carSerial && t.carSerial) item.carSerial = t.carSerial;
    });
    const depGrouped = new Map<string, number>();
    return Array.from(groups.values()).sort((a, b) => `${a.date} ${a.heure}`.localeCompare(`${b.date} ${b.heure}`)).map(item => {
      const dayKey = item.date; const nextOrder = (depGrouped.get(dayKey) || 0) + 1; depGrouped.set(dayKey, nextOrder);
      const fuelAmount = depenses.filter(d => d.date === item.date && d.heure === item.heure && d.carMatricule === item.carMatricule).reduce((s, d) => s + d.montant, 0);
      // Trouver la capacité réelle du car pour ce départ
      const routeForItem = ROUTES.find(r => `${r.depart} → ${r.arrivee}` === item.trajet);
      const carForItem = routeForItem?.fleet.find(c => c.carId === item.carId);
      const capaciteItem = Math.max((carForItem?.capacite ?? 65) - 1, 0);
      return { ...item, order: nextOrder, remainingSeats: Math.max(capaciteItem - item.soldCount - item.reservedCount, 0), fuelAmount };
    });
  }, [tickets, depenses]);

  const searchedDepartures = useMemo(() => departureSummaries.filter(dep => {
    const inDateRange = (!searchStartDate || dep.date >= searchStartDate) && (!searchEndDate || dep.date <= searchEndDate);
    const byDriver = !searchDriver.trim() || dep.chauffeur.toLowerCase().includes(searchDriver.trim().toLowerCase());
    const byMat = !searchMatricule.trim() || dep.carMatricule.toLowerCase().includes(searchMatricule.trim().toLowerCase());
    const byOrder = searchDepartureOrder === "tous" || dep.order === Number(searchDepartureOrder);
    return inDateRange && byDriver && byMat && byOrder;
  }), [departureSummaries, searchStartDate, searchEndDate, searchDriver, searchMatricule, searchDepartureOrder]);

  useEffect(() => { if (!searchedDepartures.length) { setSelectedSearchDepartureKey(""); return; } if (!searchedDepartures.some(d => d.key === selectedSearchDepartureKey)) setSelectedSearchDepartureKey(searchedDepartures[0].key); }, [searchedDepartures, selectedSearchDepartureKey]);
  const selectedSearchedDeparture = useMemo(() => searchedDepartures.find(d => d.key === selectedSearchDepartureKey) || null, [searchedDepartures, selectedSearchDepartureKey]);

  const dailyDepartureBreakdown = useMemo(() => departureSummaries.filter(d => d.date === travelDate).map(d => ({ heure:d.heure, trajet:d.trajet, carId:d.carId, carMatricule:d.carMatricule, chauffeur:d.chauffeur, ticketsVendus:d.soldCount, montantVendu:d.soldAmount, carburant:d.fuelAmount })), [departureSummaries, travelDate]);

  function refreshTickets() { setTickets(readLocalTickets()); }

  // ── HANDLERS ──

  async function handleValidateSale() {
    if (!userRole) { showToast("Connectez-vous d'abord.", "error"); return; }
    if (isSeller && !sellerCanSell) { showToast("Cette caisse n'est pas autorisée à vendre.", "error"); return; }
    if (isDayLocked) { showToast("La journée est clôturée et verrouillée.", "error"); return; }
    if (!actualVehicleMatricule.trim()) { showToast("Saisissez l'immatriculation du véhicule.", "error"); return; }
    if (isClosed) { showToast("Ce départ est clôturé.", "error"); return; }
    if (selectedSeats.length === 0) { showToast("Sélectionnez au moins un siège.", "error"); return; }
    if (selectedSeats.some(s => soldSeats.includes(s) || reservedSeats.includes(s))) { showToast("Un siège est déjà occupé.", "error"); return; }
    const numero = nextNumero("V");
    const payload: TicketPayload = { trajet:`${selectedRoute.depart} → ${selectedRoute.arrivee}`, date:travelDate, heure:travelTime, siege:selectedSeats, nom:"", telephone:"", paiement:paymentMethod, montant:totalAmount, statut:"vendu", numero, carId:activeCar.carId, carMatricule:currentVehicleMatricule, carModel:activeCar.carModel, carSerial:activeCarSerial };
    await saveTicketLocally(payload);
    const result = await saveTicketToApi(payload);
    updateSyncState(numero, result.remote, result.errorMsg || "");
    setLastNumero(result.numero);
    setConnStatus(result.remote ? "online" : "offline");
    refreshTickets();
    showToast(result.remote ? `Ticket ${numero} synchronisé ✓` : `Enregistré localement. ${result.errorMsg || ""}`, result.remote ? "success" : "warning");
    void printTickets(result.numero, selectedRoute, activeCar, currentVehicleMatricule, activeCarSerial, travelDate, travelTime, selectedSeats, totalAmount, "VENDU", driverName.trim());
    setSelectedSeats([]);
  }

  async function handleReserve() {
    if (!userRole) { showToast("Connectez-vous d'abord.", "error"); return; }
    if (isSeller && !sellerCanReserve) { showToast("Cette caisse n'est pas autorisée à réserver.", "error"); return; }
    if (isDayLocked) { showToast("La journée est clôturée.", "error"); return; }
    if (!actualVehicleMatricule.trim()) { showToast("Saisissez l'immatriculation du véhicule.", "error"); return; }
    if (isClosed) { showToast("Ce départ est clôturé.", "error"); return; }
    if (selectedSeats.length === 0) { showToast("Sélectionnez un siège.", "error"); return; }
    if (!resNom.trim() || !resPhone.trim()) { showToast("Nom et téléphone obligatoires.", "error"); return; }
    if (selectedSeats.some(s => soldSeats.includes(s) || reservedSeats.includes(s))) { showToast("Un siège est déjà occupé.", "error"); return; }
    const numero = nextNumero("R");
    const payload: TicketPayload = { trajet:`${selectedRoute.depart} → ${selectedRoute.arrivee}`, date:travelDate, heure:travelTime, siege:selectedSeats, nom:resNom.trim(), telephone:resPhone.trim(), paiement:"EN ATTENTE", montant:totalAmount, statut:"reserve", numero, carId:activeCar.carId, carMatricule:actualVehicleMatricule.trim()||activeCar.carMatricule, carModel:activeCar.carModel, carSerial:activeCarSerial };
    await saveTicketLocally(payload);
    const result = await saveTicketToApi(payload);
    updateSyncState(numero, result.remote, result.errorMsg || "");
    setLastNumero(result.numero);
    setConnStatus(result.remote ? "online" : "offline");
    refreshTickets();
    showToast(result.remote ? `Réservation ${numero} synchronisée ✓` : "Réservation enregistrée localement.", result.remote ? "success" : "warning");
    printTickets(result.numero, selectedRoute, activeCar, currentVehicleMatricule, activeCarSerial, travelDate, travelTime, selectedSeats, totalAmount, "RÉSERVÉ", driverName.trim());
    setResNom(""); setResPhone(""); setSelectedSeats([]);
  }

  function handlePrintReservedTicket(ticket: SavedTicket) {
    if (isSeller && !sellerCanPrintReserve) { showToast("Cette caisse ne peut pas imprimer les réservations.", "error"); return; }
    const [dep, arr] = ticket.trajet.split(" → ");
    const route = routes.find(r => r.depart === dep && r.arrivee === arr) || selectedRoute;
    const car = route.fleet.find(c => c.carId === ticket.carId) || activeCar;
    printTickets(ticket.numero, route, car, ticket.carMatricule, ticket.carSerial||"---", ticket.date, ticket.heure, ticket.siege, ticket.montant, "RÉSERVÉ");
  }

  async function handleValidateReservation(ticket: SavedTicket) {
    const payment = window.prompt("Moyen de paiement :\nEspèces\nOrange Money\nWave Money", resPayment);
    if (!payment) return;
    if (!["Espèces","Orange Money","Wave Money"].includes(payment)) { showToast("Paiement invalide.", "error"); return; }
    setResPayment(payment);
    const all = readLocalTickets(); const idx = all.findIndex(t => t.numero === ticket.numero);
    if (idx === -1) return;
    all[idx] = { ...all[idx], statut:"vendu", paiement:payment, synced:false, syncError:"" };
    writeLocalTickets(all); refreshTickets(); showToast(`Réservation validée (${payment}) ✓`);
  }

  function handleCancelReservation(ticket: SavedTicket) {
    if (isSeller && !sellerCanCancelReserve) { showToast("Cette caisse ne peut pas annuler les réservations.", "error"); return; }
    if (!window.confirm("Annuler cette réservation ?")) return;
    writeLocalTickets(readLocalTickets().filter(t => t.numero !== ticket.numero));
    refreshTickets(); showToast("Réservation annulée.");
  }

  async function handleCloseDeparture() {
    if (!userRole) { showToast("Connectez-vous d'abord.", "error"); return; }
    if (isDayLocked) { showToast("La journée est clôturée.", "error"); return; }
    if (isClosed) { showToast("Déjà clôturé.", "error"); return; }
    const soldCount = routeTickets.filter(t => t.statut === "vendu").reduce((n, t) => n + t.siege.length, 0);
    const MIN_PASSENGERS = 30;
    if (soldCount < MIN_PASSENGERS) {
      showToast(`Clôture impossible — ${soldCount} passager(s) vendu(s) seulement. Minimum requis : ${MIN_PASSENGERS}.`, "error");
      return;
    }
    const soldAmount = routeTickets.filter(t => t.statut === "vendu").reduce((n, t) => n + t.montant, 0);
    const remainingSeats = Math.max(sellableCapacity - soldSeats.length - reservedSeats.length, 0);

    if (!window.confirm(
      `CLOTURE DU DEPART\n\n` +
      `${selectedRoute.depart} → ${selectedRoute.arrivee} — ${travelTime}\n` +
      `Vehicule : ${currentVehicleMatricule}\n` +
      `Tickets vendus : ${soldCount}\n` +
      `Montant : ${soldAmount.toLocaleString("fr-FR")} FCFA\n\n` +
      `Confirmer la cloture ?`
    )) return;

    // Clôturer d'abord localement et sur le serveur
    const result = await cloturerDepart(departureKey);
    if (!result.ok && !result.degraded) {
      showToast(`Clôture refusée : ${result.error}`, "error");
      return;
    }
    if (!result.ok && result.degraded) {
      showToast("⚠ Serveur injoignable — clôture locale uniquement.", "warning");
    }

    const updatedClosed = Array.from(new Set([...closedKeys, departureKey]));
    setClosedKeys(updatedClosed); writeClosedDepartures(updatedClosed); setSelectedSeats([]);

    // Imprimer le bon de clôture SANS carburant (sera saisi après)
    // Le carburant est à 0 maintenant — il sera ajouté séparément
    printDepartureClosure(
      selectedRoute, activeCar, currentVehicleMatricule, activeCarSerial,
      travelDate, travelTime, soldCount, soldAmount, remainingSeats,
      0 // carburant = 0 à la clôture, sera saisi après
    );

    showToast("Départ clôturé — bon imprimé. Saisissez le carburant maintenant.", "success");
  }

  function handleAddDepense() {
    if (!userRole) { showToast("Connectez-vous d'abord.", "error"); return; }
    if (isDayLocked) { showToast("Journée clôturée.", "error"); return; }
    if (isClosed) { showToast("Départ clôturé.", "error"); return; }
    if (depenseMontant <= 0) { showToast("Montant invalide.", "error"); return; }
    const mat = depenseMatricule.trim().toUpperCase() || currentVehicleMatricule || activeCar.carMatricule;
    const desc = depenseDescription.trim() || "Carburant";
    setDepenses(prev => [...prev, { carMatricule:mat, date:travelDate, heure:travelTime, montant:depenseMontant, description:desc, carId:activeCar.carId, trajet:`${selectedRoute.depart} → ${selectedRoute.arrivee}`, chauffeur:driverName.trim(), carSerial:activeCarSerial }]);
    setDepenseMontant(0); setDepenseMatricule(""); setDepenseDescription("Carburant"); showToast(`Dépense enregistrée.`);
  }

  async function handleSync() {
    const result = await syncAllLocal(); refreshTickets(); setSyncState(result);
    setConnStatus(USE_REMOTE_API ? (result.failed === 0 ? "online" : "offline") : "offline");
    showToast(`Sync — OK:${result.synced} Échec:${result.failed} Déjà:${result.skipped}`, result.failed > 0 ? "warning" : "success");
  }

  function handleCloseDayAndSavePdf() {
    if (!isManager && !isAdmin) { showToast("Action réservée au gestionnaire.", "error"); return; }
    if (isDayLocked) { showToast("La journée est déjà clôturée.", "error"); return; }
    const ventes = tickets.filter(t => t.date === travelDate && t.statut === "vendu");
    const carburant = depenses.filter(d => d.date === travelDate && (d.description||"").toLowerCase().includes("carburant"));
    if (ventes.length === 0 && carburant.length === 0) { showToast("Aucune donnée à sauvegarder.", "error"); return; }

    const totalVentes    = ventes.reduce((s, v) => s + v.montant, 0);
    const totalCarburant = carburant.reduce((s, d) => s + d.montant, 0);

    if (!window.confirm(
      `CLOTURE JOURNALIERE\n\n` +
      `Date : ${travelDate}\n` +
      `Vehicules : ${dailyDepartureBreakdown.length}\n` +
      `Total recette : ${totalVentes.toLocaleString("fr-FR")} FCFA\n` +
      `Total carburant : ${totalCarburant.toLocaleString("fr-FR")} FCFA\n` +
      `Net a verser : ${(totalVentes - totalCarburant).toLocaleString("fr-FR")} FCFA\n\n` +
      `Confirmer la cloture journaliere ?`
    )) return;

    // Clôture du jour en format A4 uniquement (impression 80mm retirée)
    const fileName = downloadDailyClosurePdf(travelDate, ventes, carburant, dailyDepartureBreakdown);
    const archive: DailyPdfArchive = {
      id: `PDF-${travelDate}-${Date.now()}`, date: travelDate, fileName,
      createdAt: new Date().toISOString(),
      ventesCount: ventes.length,
      ventesTotal: totalVentes,
      carburantTotal: totalCarburant,
    };
    const updated = [archive, ...dailyPdfArchives]; setDailyPdfArchives(updated); writeDailyPdfArchives(updated);
    const updatedLocks = Array.from(new Set([...dailyLocks, travelDate])); setDailyLocks(updatedLocks); writeDailyLocks(updatedLocks);
    showToast("Journée clôturée — bilan A4 imprimé.", "success");
  }

  function handleAdminLogin() {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    // Role "admin" → accès complet automatique sans confirmation
    if ((currentUser.role as string) === "admin") {
      setIsAdmin(true); localStorage.setItem("ait_is_admin", "1");
      showToast(`Administrateur : ${currentUser.fullName} — accès complet ✓`, "success");
      return;
    }
    // Role "gestionnaire" → confirmation requise
    if (currentUser.role === "gestionnaire") {
      if (isAdmin) {
        setIsAdmin(false); localStorage.removeItem("ait_is_admin");
        showToast("Mode admin désactivé.", "warning");
        return;
      }
      const code = window.prompt("Activer le mode administrateur ?\nTapez OK pour confirmer :");
      if (code !== null && code.trim().length > 0) {
        setIsAdmin(true); localStorage.setItem("ait_is_admin", "1");
        showToast(`Mode admin activé — ${currentUser.fullName} ✓`, "success");
      }
      return;
    }
    showToast("Accès admin réservé au rôle administrateur ou gestionnaire.", "error");
  }

  function handleCreateCashDesk() {
    if (!isManager && !isAdmin) { showToast("Action réservée au gestionnaire.", "error"); return; }
    if (!newCashDeskLabel.trim()) { showToast("Nom de caisse obligatoire.", "error"); return; }
    const item: CashDesk = { id:`desk-${Date.now()}`, label:newCashDeskLabel.trim(), agencyId:selectedAgencyId, canSell:true, canReserve:true, canPrintReserve:true, canCancelReserve:true, isActive:true };
    const updated = [item, ...cashDesks]; setCashDesks(updated); writeCashDesks(updated); setNewCashDeskLabel(""); showToast("Nouvelle caisse ajoutée.", "success");
  }

  function toggleCashDesk(cashDeskId: string) {
    if (!isManager && !isAdmin) return;
    const updated = cashDesks.map(c => c.id === cashDeskId ? { ...c, isActive: !c.isActive } : c); setCashDesks(updated); writeCashDesks(updated);
  }

  function handleUpdateCashDeskPermissions() {
    if (!isAdmin && !isManager) return;
    if (!selectedCashDesk) return;
    const updated = cashDesks.map(c => c.id === selectedCashDesk.id ? { ...c, canSell:deskCanSell, canReserve:deskCanReserve, canPrintReserve:deskCanPrintReserve, canCancelReserve:deskCanCancelReserve } : c);
    setCashDesks(updated); writeCashDesks(updated); showToast("Permissions de caisse mises à jour.", "success");
  }

  function handleDeleteSelectedRoute() {
    if (!isAdmin) { showToast("Action réservée à l'administrateur.", "error"); return; }
    if (routes.length <= 1) { showToast("Impossible de supprimer le dernier trajet.", "error"); return; }
    if (!window.confirm(`Supprimer le trajet ${selectedRoute.depart} → ${selectedRoute.arrivee} ?`)) return;
    const remaining = routes.filter(r => r.id !== selectedRoute.id); setRoutes(remaining); setSelectedRouteId(remaining[0].id); showToast("Trajet supprimé.", "success");
  }

  function handleUpdateSelectedRoute() {
    if (!isAdmin) { showToast("Action réservée à l'administrateur.", "error"); return; }
    if (!selectedRoute) return;
    const horaires = adminHoraires.split(",").map(h => h.trim()).filter(Boolean);
    const updated = routes.map(r => r.id === selectedRoute.id ? { ...r, depart:adminDepart.trim()||r.depart, arrivee:adminArrivee.trim()||r.arrivee, prix:Number(adminPrix)>0?Number(adminPrix):r.prix, horaires:horaires.length?horaires:r.horaires, scheduleAssignments:horaires.length?Object.fromEntries(horaires.map((h,idx)=>[h,r.fleet[idx%r.fleet.length]?.carId||r.fleet[0]?.carId||""])):r.scheduleAssignments } : r);
    setRoutes(updated); showToast("Trajet modifié et sauvegardé.", "success");
  }

  function handleAddRoute() {
    if (!isAdmin) { showToast("Action réservée à l'administrateur.", "error"); return; }
    if (!newRouteDepart.trim() || !newRouteArrivee.trim() || Number(newRoutePrix) <= 0) { showToast("Départ, arrivée et prix obligatoires.", "error"); return; }
    const horaires = newRouteHoraires.split(",").map(h => h.trim()).filter(Boolean);
    const templateFleet = routes[0]?.fleet || ROUTES[0].fleet;
    const newId = Math.max(...routes.map(r => r.id), 0) + 1;
    const route: Route = { id:newId, depart:newRouteDepart.trim(), arrivee:newRouteArrivee.trim(), prix:Number(newRoutePrix), horaires:horaires.length?horaires:["06:00"], fleet:templateFleet, scheduleAssignments:Object.fromEntries((horaires.length?horaires:["06:00"]).map((h,idx)=>[h,templateFleet[idx%templateFleet.length]?.carId||templateFleet[0]?.carId||""])) };
    setRoutes(prev => [...prev, route]); setNewRouteDepart(""); setNewRouteArrivee(""); setNewRoutePrix(0); setNewRouteHoraires("");
    showToast("Nouveau trajet ajouté.", "success");
  }

  async function handleCreateEnterpriseUser() {
  if (!isAdmin) return;

  const targetAgency = newUserAgencyId || selectedAgencyId;

  if (!newUserFullName.trim() || !newUsername.trim() || !newPassword.trim()) {
    showToast("Nom, identifiant et mot de passe obligatoires.", "error");
    return;
  }

  // Snapshot des champs avant de les vider (pour le fallback local)
  const newUser: AppUser = {
    id: newUsername.trim(),
    username: newUsername.trim(),
    password: "",
    role: newUserRole,
    agencyId: targetAgency,
    fullName: newUserFullName.trim(),
    isActive: true,
  };

  // Si aucun token JWT, on crée uniquement en local — pas d'appel API
  const token = localStorage.getItem("ait_token") || localStorage.getItem("token") || "";
  if (!token) {
    const updated = [newUser, ...enterpriseUsers.filter(u => u.username !== newUser.username)];
    setEnterpriseUsers(updated);
    writeEnterpriseUsers(updated);
    setNewUserFullName(""); setNewUsername(""); setNewPassword(""); setNewUserRole("vendeur");
    showToast("Utilisateur créé localement (pas de connexion HFSQL active).", "warning");
    return;
  }

  try {
    await apiJson(API.UTILISATEURS, {
      method: "POST",
      body: JSON.stringify({
        username: newUser.username,
        password: newPassword.trim(),
        role: newUser.role,
        agencyId: newUser.agencyId,
        fullName: newUser.fullName,
        isActive: true,
      }),
    });

    setNewUserFullName("");
    setNewUsername("");
    setNewPassword("");
    setNewUserRole("vendeur");

    // Rechargement depuis HFSQL — si ça échoue, on insère localement
    try {
      const users = await fetchEnterpriseUsersFromServer();
      setEnterpriseUsers(users);
      writeEnterpriseUsers(users);
      showToast("Utilisateur créé dans HFSQL ✓", "success");
    } catch (reloadErr: any) {
      const updated = [newUser, ...enterpriseUsers.filter(u => u.username !== newUser.username)];
      setEnterpriseUsers(updated);
      writeEnterpriseUsers(updated);
      showToast(`Créé dans HFSQL ✓ — rechargement liste échoué : ${reloadErr?.message || "erreur inconnue"}`, "warning");
    }
  } catch (err: any) {
    const msg: string = err?.message || "Erreur création utilisateur HFSQL.";
    const isAuth = msg.includes("Session expirée") || msg.includes("Accès refusé") || msg.includes("401") || msg.includes("403");
    if (isAuth) {
      // Token expiré en cours de session — on crée localement + alerte
      const updated = [newUser, ...enterpriseUsers.filter(u => u.username !== newUser.username)];
      setEnterpriseUsers(updated);
      writeEnterpriseUsers(updated);
      setNewUserFullName(""); setNewUsername(""); setNewPassword(""); setNewUserRole("vendeur");
      showToast("Session expirée — utilisateur créé localement. Reconnectez-vous pour synchroniser.", "warning");
    } else {
      showToast(msg, "error");
    }
  }
}

  async function toggleEnterpriseUser(userId: string) {
  if (!isAdmin) return;

  const user = enterpriseUsers.find((u) => String(u.id) === String(userId) || String(u.username) === String(userId));
  if (!user) return;

  try {
    await apiJson(`/api/utilisateurs/${encodeURIComponent(user.username)}`, {
      method: "PATCH",
      body: JSON.stringify({
        username: user.username,
        agencyId: user.agencyId,
        isActive: !user.isActive,
      }),
    });

    const users = await fetchEnterpriseUsersFromServer();
    setEnterpriseUsers(users);
    writeEnterpriseUsers(users);

    showToast(!user.isActive ? "Utilisateur activé dans HFSQL." : "Utilisateur bloqué dans HFSQL.", "success");
  } catch (err: any) {
    showToast(err?.message || "Erreur modification utilisateur HFSQL.", "error");
  }
}

  async function handleDeleteUser(userId: string) {
  if (!isAdmin) return;

  const user = enterpriseUsers.find((u) => String(u.id) === String(userId) || String(u.username) === String(userId));
  const login = user?.username || userId;
  const agencyId = user?.agencyId || selectedAgencyId;

  if (!confirm(`Supprimer définitivement l'utilisateur ${login} ?`)) return;

  try {
    await apiJson(API.UTILISATEUR(login), {
      method: "DELETE",
    });

    const users = await fetchEnterpriseUsersFromServer();
    setEnterpriseUsers(users);
    writeEnterpriseUsers(users);

    showToast("Utilisateur supprimé dans HFSQL.", "success");
  } catch (err: any) {
    showToast(err?.message || "Erreur suppression utilisateur HFSQL.", "error");
  }
}

  async function handleSaveEditUser() {
  if (!isAdmin || !editUserId) return;

  const editingUser = editUserData as Partial<AppUser>;
  const login = editingUser.username || editUserId;
  const agencyId = editingUser.agencyId || selectedAgencyId;

  if (!String(editingUser.fullName || "").trim() || !login.trim()) {
    showToast("Nom complet et identifiant obligatoires.", "error");
    return;
  }

  try {
    await apiJson(API.UTILISATEUR(login), {
      method: "PATCH",
      body: JSON.stringify({
        username: login,
        password: editingUser.password || undefined,
        role: editingUser.role,
        agencyId,
        fullName: editingUser.fullName,
        isActive: editingUser.isActive !== false,
      }),
    });

    const users = await fetchEnterpriseUsersFromServer();
    setEnterpriseUsers(users);
    writeEnterpriseUsers(users);

    setEditUserId(null);
    setEditUserData({});
    showToast("Utilisateur modifié dans HFSQL.", "success");
  } catch (err: any) {
    showToast(err?.message || "Erreur modification utilisateur HFSQL.", "error");
  }
}

  function handleUpdateAgency() {
    if (!isAdmin) { showToast("Action réservée à l'administrateur.", "error"); return; }
    if (!selectedAgency) return;
    const updated = agencies.map(a => a.id === selectedAgency.id ? { ...a, name:adminAgencyName.trim()||a.name, city:adminAgencyCity.trim()||a.city } : a);
    setAgencies(updated); showToast("Agence modifiée.", "success");
  }

  function handleAddAgency() {
    if (!isAdmin) return;
    if (!newAgencyName.trim() || !newAgencyCity.trim()) { showToast("Nom et ville obligatoires.", "error"); return; }
    const id = newAgencyName.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (agencies.some(a => a.id === id)) { showToast("Une agence avec ce nom existe déjà.", "error"); return; }
    const agency: Agency = { id, name:newAgencyName.trim(), city:newAgencyCity.trim(), guichetId:newAgencyGuichet.trim()||`POSTE-${id.toUpperCase()}-01` };
    setAgencies(prev => [...prev, agency]); writeAgencies([...agencies, agency]);
    setNewAgencyName(""); setNewAgencyCity(""); setNewAgencyGuichet(""); showToast("Agence ajoutée.", "success");
  }

  function handleDeleteAgency(agencyId: string) {
    if (!isAdmin) return;
    if (!window.confirm("Supprimer cette agence ? Tous les utilisateurs et caisses liés seront aussi supprimés.")) return;
    const updatedAgencies = agencies.filter(a => a.id !== agencyId);
    const updatedUsers = enterpriseUsers.filter(u => u.agencyId !== agencyId);
    const updatedDesks = cashDesks.filter(c => c.agencyId !== agencyId);
    setAgencies(updatedAgencies); writeAgencies(updatedAgencies);
    setEnterpriseUsers(updatedUsers); writeEnterpriseUsers(updatedUsers);
    setCashDesks(updatedDesks); writeCashDesks(updatedDesks);
    showToast("Agence supprimée.", "success");
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  const handleLogout = useCallback(() => {
    clearToken(); localStorage.removeItem("ait_is_admin");
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveTab("vente");
    setSelectedSeats([]);
    setLastNumero("—");
    showToast("Déconnecté.");
  }, []);

  const navTabs: { id: NavTab; label: string; icon: string }[] = [
    { id: "vente", label: "Target & Départ", icon: "🎫" },
    { id: "gestion", label: "Gestion des départs", icon: "📋" },
    { id: "rapports", label: "Rapports & Finance", icon: "📊" },
    { id: "admin", label: "Administration", icon: "⚙️" },
  ];

  // BLOQUER l'interface si pas connecté — afficher uniquement la page de connexion
  if (!currentUser) {
    return (
      <LoginModal
        onClose={() => {}}
        onLogin={user => {
          setCurrentUser(user);
          setSelectedAgencyId(user.agencyId);
          setShowLoginModal(false);
          if (user.role === "gestionnaire" || (user.role as string) === "admin") {
            setIsAdmin(true);
            localStorage.setItem("ait_is_admin", "1");
          }
          showToast(`Connecté : ${user.fullName} (${user.role})`, "success");
        }}
        agencies={agencies}
      />
    );
  }

  return (
    <LicenceGate>
    <>

      <div className="app">
        {/* Toast */}
        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

        {/* Login Modal (pour reconnexion) */}
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLogin={user => {
              setCurrentUser(user);
              setSelectedAgencyId(user.agencyId);
              setShowLoginModal(false);
              // Activer admin automatiquement si gestionnaire ou admin
              if (user.role === "gestionnaire" || (user.role as string) === "admin") {
                setIsAdmin(true);
                localStorage.setItem("ait_is_admin", "1");
              }
              showToast(`Connecté : ${user.fullName} (${user.role})`, "success");
            }}
            agencies={agencies}
          />
        )}

        {/* Header */}
        <header className="hdr">
          <div className="hdr-brand">
            <div className="hdr-logo">
              <img src="/ait-logo.png" alt="AIT Logo" />
            </div>
            <div>
              <div className="hdr-name">
                <div className="hdr-name-line1">ALINO L'IMPÉRIAL TRANSPORT</div>
                <div className="hdr-name-line2">AIT · {selectedAgency.name} · {selectedCashDesk?.label || "—"} · {fmtDateFr(todayIso())}</div>
              </div>
            </div>
          </div>
          <div className="hdr-right">
            <span className={`conn-badge ${connStatus === "online" ? "conn-online" : connStatus === "offline" ? "conn-offline" : "conn-idle"}`}>
              {connStatus === "online" ? "✓ En ligne" : connStatus === "offline" ? "⚠ Local" : "— Attente"}
            </span>
            {syncState && <span style={{ fontSize: 12, color: "#64748b" }}>Sync OK:{syncState.synced} ✗:{syncState.failed}</span>}
            <button className="btn btn-ghost btn-sm" onClick={handleSync}>↑ Sync</button>
            {currentUser ? (
              <>
                <span className={`user-chip ${isAdmin ? "admin-chip" : ""}`}>{currentUser.fullName} · {currentUser.role}{isAdmin ? " + Admin" : ""}</span>
                <button className="btn btn-red btn-sm" onClick={handleLogout}>🚪 Déconnexion</button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setShowLoginModal(true)}>🔐 Connexion</button>
            )}
            <button
              className={`btn ${isAdmin ? "btn-admin" : "btn-ghost"} btn-sm`}
              onClick={handleAdminLogin}
              title={!currentUser ? "Connectez-vous d'abord pour activer le mode admin" : isAdmin ? "Désactiver le mode admin" : "Activer le mode admin (gestionnaire requis)"}
              style={{ opacity: !currentUser ? 0.45 : 1 }}
            >
              {isAdmin ? "⚙️ Admin actif" : "⚙️ Admin"}
            </button>
          </div>
        </header>

        {/* Nav */}
        <div className="nav">
          {navTabs
            .filter(t => {
              if (t.id === "vente") return true;
              if (t.id === "gestion") return !!userRole; // vendeur + gestionnaire + admin
              if (t.id === "rapports") return isManager || isAdmin;
              if (t.id === "admin") return isManager || isAdmin;
              return false;
            })
            .map(t => (
              <button key={t.id} className={`nav-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
        </div>

        {/* Content */}
        <div className="nav-content">

          {/* ═══ ONGLET VENTE ═══ */}
                    {activeTab === "vente" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* ── BARRE DÉPART — ligne pleine largeur ── */}
              <div className="card" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span className="card-hd" style={{ margin: 0, fontSize: 14 }}>🚌 Départ</span>
                  {isDayLocked && <span className="badge badge-red">🔒 Journée verrouillée</span>}
                  {isClosed    && <span className="badge badge-red">Départ clôturé</span>}
                  {hasStartedSales && <span className="badge badge-yellow">🔒 Immat. verrouillée</span>}
                  {selectedRoute.daysOfWeek && <span className="badge badge-blue">📅 {selectedRoute.daysOfWeek.join(", ")}</span>}
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
                    Car prévu : <b style={{ color: "#e2e8f0" }}>{activeCar?.carId} · {activeCar?.carModel}</b>
                    <span style={{ margin: "0 8px", color: "#334155" }}>·</span>
                    Série : <b style={{ color: "#f5d020", fontFamily: "JetBrains Mono,monospace" }}>{activeCarSerial}</b>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
                  <div className="field">
                    <label>Agence</label>
                    <select className="sel" value={selectedAgencyId} onChange={e => setSelectedAgencyId(e.target.value)} disabled={!!currentUser && !isAdmin}>
                      {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Caisse</label>
                    <select className="sel" value={selectedCashDeskId} onChange={e => setSelectedCashDeskId(e.target.value)}>
                      {agencyCashDesks.map(c => <option key={c.id} value={c.id}>{c.label}{!c.isActive ? " ⛔" : ""}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label>Trajet</label>
                    <select className="sel" value={selectedRouteId} onChange={e => setSelectedRouteId(Number(e.target.value))}>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.depart} → {r.arrivee} · {fmtFcfa(r.prix)}{r.daysOfWeek ? ` [${r.daysOfWeek.join(",")}]` : ""}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Date</label>
                    <input type="date" className="inp" value={travelDate} onChange={e => setTravelDate(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Heure</label>
                    <select className="sel" value={travelTime} onChange={e => { setTravelTime(e.target.value); setSelectedSeats([]); }}>
                      {selectedRoute.horaires.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label>Véhicule</label>
                    <select className="sel" value={selectedCarId} onChange={e => { const cid = e.target.value; setSelectedCarId(cid); setSelectedSeats([]); const chosen = activeFleet.find(x => x.carId === cid); if (chosen) setActualVehicleMatricule(chosen.carMatricule); }} disabled={isClosed || isDayLocked || !userRole || hasStartedSales}>
                      {activeFleet.map(c => <option key={c.carId} value={c.carId}>{c.carModel} – {Math.max(c.capacite - 1, 0)} places – {c.carMatricule}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label>Immatriculation véhicule</label>
                    <input className="inp" value={actualVehicleMatricule} onChange={e => setActualVehicleMatricule(e.target.value.toUpperCase())} placeholder="Ex: AB-5678-CI" disabled={isClosed || isDayLocked || !userRole || hasStartedSales} />
                  </div>
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label>Chauffeur</label>
                    <select className="sel" value={driverName} onChange={e => setDriverName(e.target.value)} disabled={isClosed || isDayLocked || !userRole || hasStartedSales}>
                      <option value="">— Choisir un chauffeur —</option>
                      {chauffeursList.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                      {driverName && !chauffeursList.some(c => c.nom === driverName) && <option value={driverName}>{driverName}</option>}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── 3 COLONNES PRINCIPALES ── */}
              <div className="grid-main">

                {/* ─ COL GAUCHE : Plan cabine + Caisse du jour ─ */}
                <div className="col">

                  {/* Plan cabine */}
                  <div className="card" style={{ padding: "12px 12px 14px" }}>
                    <div className="card-hd">🎫 Plan cabine</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "#6b7fa8" }}>🚌 {activeCar?.carId} · {activeCar?.carModel}</span>
                      <span className="badge badge-blue" style={{ fontSize: 11 }}>{soldSeats.length + reservedSeats.length}/{sellableCapacity}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "#64748b", marginBottom: 8, alignItems: "center" }}>
                      <span><span className="legend-dot" style={{ background: "rgba(14,165,233,.5)", width: 8, height: 8, display: "inline-block", borderRadius: "50%", marginRight: 3 }} />Libre</span>
                      <span><span className="legend-dot" style={{ background: "#0ea5e9", width: 8, height: 8, display: "inline-block", borderRadius: "50%", marginRight: 3 }} />Sélect.</span>
                      <span><span className="legend-dot" style={{ background: "rgba(245,208,32,.5)", width: 8, height: 8, display: "inline-block", borderRadius: "50%", marginRight: 3 }} />Réservé</span>
                      <span><span className="legend-dot" style={{ background: "rgba(239,68,68,.5)", width: 8, height: 8, display: "inline-block", borderRadius: "50%", marginRight: 3 }} />Vendu</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <SeatGrid capacity={sellableCapacity} selected={selectedSeats} sold={soldSeats} reserved={reservedSeats} onToggle={toggleSeat} />
                    </div>
                  </div>

                  {/* Caisse du jour */}
                  <div className="card">
                    <div className="card-hd">💰 Caisse — {fmtDateFr(travelDate)}</div>
                    <div className="stat-grid">
                      <div className="stat stat-blue"><div className="stat-lbl">Ventes</div><div className="stat-val">{ventesDuJour.length}</div><div className="stat-sub">{fmtFcfa(totalVentes)}</div></div>
                      <div className="stat stat-orange"><div className="stat-lbl">Réservations</div><div className="stat-val">{reservesDuJour.length}</div><div className="stat-sub">En attente</div></div>
                      <div className="stat stat-green"><div className="stat-lbl">Espèces</div><div className="stat-val" style={{ fontSize: 15 }}>{fmtFcfa(cashEspeces)}</div></div>
                      <div className="stat stat-teal"><div className="stat-lbl">Orange</div><div className="stat-val" style={{ fontSize: 15 }}>{fmtFcfa(cashOrange)}</div></div>
                      <div className="stat stat-purple"><div className="stat-lbl">Wave</div><div className="stat-val" style={{ fontSize: 15 }}>{fmtFcfa(cashWave)}</div></div>
                      <div className={`stat ${benefice >= 0 ? "stat-green" : "stat-red"}`}><div className="stat-lbl">Bénéfice net</div><div className="stat-val" style={{ fontSize: 15 }}>{fmtFcfa(benefice)}</div></div>
                    </div>
                  </div>
                </div>

                {/* ─ COL CENTRE : Mode vente/résa + formulaire + carburant ─ */}
                <div className="col">

                  {/* Tabs vente / réservation */}
                  <div className="mode-tabs">
                    <button className={`mode-tab ${mode === "vente" ? "active-vente" : ""}`} onClick={() => setMode("vente")}>🎫 Vente directe &amp; réservation</button>
                    <button className={`mode-tab ${mode === "reservation" ? "active-res" : ""}`} onClick={() => setMode("reservation")}>📋 Billets réservés</button>
                  </div>

                  {mode === "vente" && (
                    <div className="card">
                      <div className="card-hd">🎫 Vente directe</div>
                      <div className="field"><label>Mode de paiement</label>
                        <select className="sel" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={isClosed || isDayLocked}>
                          <option>Espèces</option><option>Orange Money</option><option>Wave Money</option>
                        </select>
                      </div>
                      <div className="sum-box" style={{ marginTop: 12 }}>
                        <div className="sum-row"><span>Sièges sélectionnés</span><b>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "—"}</b></div>
                        <div className="sum-row"><span>Prix unitaire</span><b>{fmtFcfa(selectedRoute.prix)}</b></div>
                        <div className="sum-row"><span>Total</span><b className="amt-green">{fmtFcfa(totalAmount)}</b></div>
                        <div className="sum-row">
                          <span>Passagers vendus</span>
                          <b style={{ color: soldSeats.length >= 30 ? "#4ade80" : "#f5d020" }}>
                            {soldSeats.length} / min. 30 {soldSeats.length >= 30 ? "✓" : "⏳"}
                          </b>
                        </div>
                        <div className="sum-row"><span>Dernier n°</span><b style={{ fontFamily: "JetBrains Mono,monospace", color: "#f5d020" }}>{lastNumero}</b></div>
                      </div>
                      <div className="btn-row">
                        <button className="btn btn-green" disabled={isClosed || isDayLocked || selectedSeats.length === 0 || !userRole || (isSeller && !sellerCanSell)} onClick={handleValidateSale}>✓ Valider & Imprimer</button>
                        {userRole && (
                          <button
                            className="btn btn-cloture"
                            onClick={handleCloseDeparture}
                            disabled={isDayLocked || isClosed}
                            title={soldSeats.length < 30 ? `Minimum 30 passagers requis (${soldSeats.length} actuellement)` : "Clôturer ce départ"}
                            style={{ opacity: soldSeats.length < 30 ? 0.55 : 1 }}
                          >
                            🔒 Clôture{soldSeats.length < 30 ? ` (${soldSeats.length}/30)` : ""}
                          </button>
                        )}
                      </div>
                      {!userRole && <p className="info-msg">⚠️ Connectez-vous pour vendre.</p>}
                      {isClosed  && <p className="info-msg">🔒 Départ clôturé — aucune vente possible.</p>}
                      {userRole && !isClosed && soldSeats.length < 30 && (
                        <p className="info-msg" style={{ color: "#f5d020" }}>⏳ {soldSeats.length} passager(s) — clôture possible à partir de 30.</p>
                      )}

                      {/* ══ SECTION CARBURANT ══ */}
                      {userRole && (
                        <>
                          <hr className="sep" style={{ marginTop: 16 }} />
                          <div className="card-hd-sm" style={{ marginTop: 12 }}>⛽ Carburant / Dépense — car sortant</div>

                          {/* Seuil : configurable gestionnaire/admin, lecture pour vendeur */}
                          <div className="sum-box" style={{ marginBottom: 10 }}>
                            <div className="sum-row">
                              <span>Seuil max carburant</span>
                              {(isManager || isAdmin) ? (
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                  <input
                                    type="number" className="inp" min="0" placeholder="Ex: 15000"
                                    value={fuelThreshold || ""}
                                    onChange={e => saveFuelThreshold(Number(e.target.value))}
                                    style={{ width: 110, padding: "3px 7px", fontSize: 13 }}
                                  />
                                  <span style={{ fontSize: 12, color: fuelThreshold > 0 ? "#f5d020" : "#64748b", whiteSpace: "nowrap" }}>
                                    {fuelThreshold > 0 ? fmtFcfa(fuelThreshold) : "Aucun seuil"}
                                  </span>
                                </div>
                              ) : (
                                <b style={{ color: fuelThreshold > 0 ? "#f5d020" : "#64748b" }}>
                                  {fuelThreshold > 0 ? fmtFcfa(fuelThreshold) : "Non défini"}
                                </b>
                              )}
                            </div>
                            <div className="sum-row">
                              <span>Carburant enregistré</span>
                              <b className={isFuelExceeded ? "amt-red" : "amt-orange"}>{fmtFcfa(carburantAvantDepart)}</b>
                            </div>
                            {isFuelExceeded && (
                              <div className="sum-row" style={{ background: "rgba(239,68,68,.15)", borderRadius: 6, padding: "6px 8px" }}>
                                <span style={{ color: "#f87171", fontWeight: 700 }}>⚠️ Dépassement carburant !</span>
                                <b style={{ color: "#f87171" }}>+{fmtFcfa(carburantAvantDepart - fuelThreshold)}</b>
                              </div>
                            )}
                          </div>

                          {/* Formulaire dépense — tous utilisateurs connectés, verrouillé après clôture */}
                          <div className="grid-2">
                            <div className="field"><label>Description</label><input className="inp" value={depenseDescription} onChange={e => setDepenseDescription(e.target.value)} placeholder="Carburant, péage..." disabled={isClosed || isDayLocked} /></div>
                            <div className="field"><label>Montant (FCFA)</label><input type="number" className="inp" min="0" placeholder="Montant" value={depenseMontant || ""} onChange={e => setDepenseMontant(Number(e.target.value))} disabled={isClosed || isDayLocked} /></div>
                            {(isManager || isAdmin) && (
                              <div className="field" style={{ gridColumn: "1/-1" }}><label>Immatriculation (optionnelle)</label><input className="inp" value={depenseMatricule} onChange={e => setDepenseMatricule(e.target.value.toUpperCase())} placeholder={currentVehicleMatricule || "AB-1234-CI"} disabled={isClosed || isDayLocked} /></div>
                            )}
                          </div>
                          {!isClosed && !isDayLocked ? (
                            <button className="btn btn-orange" style={{ marginTop: 8 }} onClick={handleAddDepense} disabled={depenseMontant <= 0}>
                              + Enregistrer dépense
                            </button>
                          ) : (
                            <p className="info-msg" style={{ marginTop: 6 }}>🔒 Dépenses verrouillées — départ clôturé.</p>
                          )}

                          {/* Liste des dépenses */}
                          {activeDepenses.length > 0 ? (
                            <div className="sum-box" style={{ marginTop: 10 }}>
                              {activeDepenses.map((d, i) => <div key={i} className="sum-row"><span>{d.description}</span><b className="amt-orange">{fmtFcfa(d.montant)}</b></div>)}
                            </div>
                          ) : (
                            <p className="info-msg" style={{ marginTop: 6 }}>Aucune dépense enregistrée pour ce départ.</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {mode === "reservation" && (
                    <div className="card">
                      <div className="card-hd">📋 Réservation</div>
                      <div className="grid-2">
                        <div className="field"><label>Nom passager *</label>
                          <input className="inp" placeholder="Nom complet" value={resNom} onChange={e => setResNom(e.target.value)} />
                        </div>
                        <div className="field"><label>Téléphone *</label>
                          <input className="inp" placeholder="07 XX XX XX" value={resPhone} onChange={e => setResPhone(e.target.value.replace(/\D/g,"").slice(0,15))} />
                        </div>
                      </div>
                      <div className="sum-box" style={{ marginTop: 12 }}>
                        <div className="sum-row"><span>Trajet</span><b>{selectedRoute.depart} → {selectedRoute.arrivee}</b></div>
                        <div className="sum-row"><span>Sièges</span><b>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "—"}</b></div>
                        <div className="sum-row"><span>Montant</span><b className="amt-orange">{fmtFcfa(totalAmount)}</b></div>
                        <div className="sum-row"><span>Paiement</span><b className="amt-orange">EN ATTENTE</b></div>
                      </div>
                      <div className="btn-row">
                        <button className="btn btn-orange" disabled={isClosed || isDayLocked || selectedSeats.length === 0 || !userRole || (isSeller && !sellerCanReserve)} onClick={handleReserve}>📋 Confirmer réservation</button>
                      </div>
                      {!userRole && <p className="info-msg">⚠️ Connectez-vous pour réserver.</p>}
                    </div>
                  )}

                  {/* Droits caisse vendeur */}
                  {isSeller && (
                    <div className="card">
                      <div className="card-hd">🔐 Droits de cette caisse</div>
                      <div className="sum-box">
                        <div className="sum-row"><span>Vente</span><b className={sellerCanSell ? "amt-green" : "amt-red"}>{sellerCanSell ? "✓ Oui" : "✗ Non"}</b></div>
                        <div className="sum-row"><span>Réservation</span><b className={sellerCanReserve ? "amt-green" : "amt-red"}>{sellerCanReserve ? "✓ Oui" : "✗ Non"}</b></div>
                        <div className="sum-row"><span>Impression résa.</span><b className={sellerCanPrintReserve ? "amt-green" : "amt-red"}>{sellerCanPrintReserve ? "✓ Oui" : "✗ Non"}</b></div>
                        <div className="sum-row"><span>Annulation résa.</span><b className={sellerCanCancelReserve ? "amt-green" : "amt-red"}>{sellerCanCancelReserve ? "✓ Oui" : "✗ Non"}</b></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─ COL DROITE : Aperçu ticket + Réservations actives ─ */}
                <div className="col">

                  {/* Aperçu ticket 80mm */}
                  <div className="card">
                    <div className="card-hd">🎟 Aperçu ticket (80 mm)</div>
                    <div className="receipt">
                      <div className="rec-logo" style={{ background: "transparent", border: "none", padding: 0 }}>
                        <img src={AIT_LOGO_B64} alt="AIT" style={{ width: 68, height: 68, objectFit: "contain", borderRadius: 4 }} />
                      </div>
                      <div className="rec-company">ALINO L'IMPÉRIAL TRANSPORT</div>
                      <div className="rec-center rec-bold">(A.I.T)</div>
                      <div className="rec-div" />
                      <div className="rec-row"><span>N°</span><span>{lastNumero}</span></div>
                      <div className="rec-row"><span>Date</span><span>{fmtDateFr(travelDate)}</span></div>
                      <div className="rec-row"><span>Passager</span><span>{mode === "reservation" && resNom.trim() ? resNom.trim() : "Client comptoir"}</span></div>
                      <div className="rec-div" />
                      <div className="rec-row"><span>Trajet</span><span>{selectedRoute.depart} → {selectedRoute.arrivee}</span></div>
                      <div className="rec-row"><span>Heure</span><span>{travelTime}</span></div>
                      <div className="rec-row"><span>Car</span><span>{activeCar?.carId} · {currentVehicleMatricule}</span></div>
                      <div className="rec-row"><span>Série car</span><span>{activeCarSerial}</span></div>
                      <div className="rec-row"><span>Siège(s)</span><span className="rec-seat">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "—"}</span></div>
                      <div className="rec-div" />
                      <div className="rec-total">TOTAL : {fmtFcfa(totalAmount)}</div>
                      <div className="rec-row"><span>Paiement</span><span>{mode === "vente" ? paymentMethod : "EN ATTENTE"}</span></div>
                      <div className="rec-div" />
                      <div className="rec-center rec-bold">MERCI — BON VOYAGE</div>
                      <div className="rec-center rec-bold">A.I.T — SOUBRÉ</div>
                      <div className="rec-cut">✂ ACCUEIL — CONTRÔLEUR — COMPTABILITÉ ✂</div>
                      <div className="rec-control">
                        <div className="rec-center rec-bold">COUPON CONTRÔLE</div>
                        <div className="rec-row"><span>N° billet</span><span>{lastNumero}</span></div>
                        <div className="rec-row"><span>Heure / Siège</span><span>{travelTime} · {selectedSeats.length > 0 ? selectedSeats.join(", ") : "—"}</span></div>
                        <div className="rec-row"><span>Montant</span><span>{fmtFcfa(totalAmount)}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Réservations actives */}
                  <div className="card">
                    <div className="card-hd">📋 Billets réservés</div>
                    <div className="tbl-wrap">
                      <table className="tbl">
                        <thead><tr><th>N°</th><th>Client</th><th>Trajet</th><th>Sièges</th><th>Actions</th></tr></thead>
                        <tbody>
                          {tickets.filter(t => t.statut === "reserve").length === 0 && <tr><td colSpan={5} className="no-data">Aucune réservation active.</td></tr>}
                          {tickets.filter(t => t.statut === "reserve").map(t => (
                            <tr key={t.numero}>
                              <td className="td-num">{t.numero}</td>
                              <td>{t.nom || "—"}</td>
                              <td style={{ fontSize: 12 }}>{t.trajet}</td>
                              <td>{t.siege.join(", ")}</td>
                              <td>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button className="btn btn-blue btn-sm" onClick={() => handlePrintReservedTicket(t)} disabled={isSeller && !sellerCanPrintReserve}>🖨</button>
                                  {(isManager || isAdmin) && <button className="btn btn-green btn-sm" onClick={() => handleValidateReservation(t)} title="Valider">✓</button>}
                                  <button className="btn btn-red btn-sm" onClick={() => handleCancelReservation(t)} disabled={isSeller && !sellerCanCancelReserve} title="Annuler">✗</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

{/* ═══ ONGLET GESTION ═══ */}
          {activeTab === "gestion" && (
            <div>
              <div className="section-title">📋 Gestion des départs du jour</div>
              {isSeller && !isManager && !isAdmin && (
                <div className="card" style={{ maxWidth: 700, marginBottom: 14 }}>
                  <div className="card-hd">📋 Tickets du jour — {fmtDateFr(travelDate)} <span className="badge badge-gray" style={{ marginLeft: 8 }}>Vue Vendeur</span></div>
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead><tr><th>N° ticket</th><th>Car</th><th>Trajet</th><th>Sièges</th><th>Montant</th><th>Statut</th><th>🖨</th></tr></thead>
                      <tbody>
                        {tickets.filter(t => t.date === travelDate).length === 0 && <tr><td colSpan={7} className="no-data">Aucun ticket ce jour.</td></tr>}
                        {tickets.filter(t => t.date === travelDate).map(t => (
                          <tr key={t.numero}>
                            <td className="td-num">{t.numero}</td>
                            <td>{t.carId}</td>
                            <td style={{ fontSize: 12 }}>{t.trajet}</td>
                            <td>{t.siege.join(", ")}</td>
                            <td><b>{fmtFcfa(t.montant)}</b></td>
                            <td><span className={`badge ${t.statut === "vendu" ? "badge-green" : "badge-yellow"}`}>{t.statut === "vendu" ? "Vendu" : "Réservé"}</span></td>
                            <td><button className="btn btn-blue btn-sm" onClick={() => { const [dep,arr]=t.trajet.split(" → "); const route=routes.find(r=>r.depart===dep&&r.arrivee===arr)||selectedRoute; const car=route.fleet.find(c=>c.carId===t.carId)||activeCar; printTickets(t.numero,route,car,t.carMatricule,t.carSerial||"---",t.date,t.heure,t.siege,t.montant,t.statut==="reserve"?"RÉSERVÉ":"VENDU"); }}>🖨</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: 12, color: "#475569", marginTop: 10 }}>{tickets.filter(t => t.date === travelDate).length} ticket(s) ce jour</p>
                </div>
              )}
              <div className="grid-main">
                <div className="col" style={{ gridColumn: "1/-1" }}>
                  {/* Historique — gestionnaire + admin */}
                  {(isManager || isAdmin) && <div className="card">
                    <div className="card-hd">
                      Historique des tickets
                      <input type="date" className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 13 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                    </div>
                    <div className="tbl-wrap">
                      <table className="tbl">
                        <thead><tr><th>N° ticket</th><th>Série</th><th>Car</th><th>Trajet</th><th>Sièges</th><th>Montant</th><th>Statut</th><th>Sync</th><th>Actions</th></tr></thead>
                        <tbody>
                          {filteredTickets.length === 0 && <tr><td colSpan={9} className="no-data">Aucun ticket pour cette date.</td></tr>}
                          {filteredTickets.map(t => (
                            <tr key={t.numero}>
                              <td className="td-num">{t.numero}</td>
                              <td className="td-muted">{t.carSerial || "—"}</td>
                              <td>{t.carId}</td>
                              <td style={{ fontSize: 12 }}>{t.trajet}</td>
                              <td>{t.siege.join(", ")}</td>
                              <td><b>{fmtFcfa(t.montant)}</b></td>
                              <td><span className={`badge ${t.statut === "vendu" ? "badge-green" : "badge-yellow"}`}>{t.statut === "vendu" ? "Vendu" : "Réservé"}</span></td>
                              <td><span className={t.synced ? "sync-ok" : t.syncError ? "sync-err" : "sync-wait"}>{t.synced ? "✓" : t.syncError ? "✗" : "⏳"}</span></td>
                              <td>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button className="btn btn-blue btn-sm" title="Réimprimer" onClick={() => {
                                    const [dep, arr] = t.trajet.split(" → ");
                                    const route = routes.find(r => r.depart === dep && r.arrivee === arr) || selectedRoute;
                                    const car = route.fleet.find(c => c.carId === t.carId) || activeCar;
                                    printTickets(t.numero, route, car, t.carMatricule, t.carSerial||"---", t.date, t.heure, t.siege, t.montant, t.statut === "reserve" ? "RÉSERVÉ" : "VENDU");
                                  }}>🖨</button>
                                  {t.statut === "reserve" && (isManager || isAdmin) && <>
                                    <button className="btn btn-green btn-sm" onClick={() => handleValidateReservation(t)}>✓</button>
                                    <button className="btn btn-red btn-sm" onClick={() => handleCancelReservation(t)}>✗</button>
                                  </>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p style={{ fontSize: 12, color: "#475569", marginTop: 10 }}>{filteredTickets.length} ticket(s) affiché(s) · {tickets.length} au total</p>
                  </div>}

                  {/* Recherche véhicule / départ — gestionnaire + admin */}
                  {(isManager || isAdmin) && <div className="card">
                    <div className="card-hd">Recherche véhicule / départ</div>
                    <div className="grid-4">
                      <div className="field"><label>Date début</label><input type="date" className="inp" value={searchStartDate} onChange={e => setSearchStartDate(e.target.value)} /></div>
                      <div className="field"><label>Date fin</label><input type="date" className="inp" value={searchEndDate} onChange={e => setSearchEndDate(e.target.value)} /></div>
                      <div className="field"><label>Chauffeur</label><input className="inp" value={searchDriver} onChange={e => setSearchDriver(e.target.value)} placeholder="Nom du chauffeur" /></div>
                      <div className="field"><label>Immatriculation</label><input className="inp" value={searchMatricule} onChange={e => setSearchMatricule(e.target.value.toUpperCase())} placeholder="AB-1234-CI" /></div>
                    </div>
                    <div className="tbl-wrap" style={{ marginTop: 12 }}>
                      <table className="tbl">
                        <thead><tr><th>Date</th><th>Départ</th><th>Heure</th><th>Chauffeur</th><th>Immat.</th><th>Trajet</th><th>Vendus</th><th>Montant</th><th>Carburant</th><th>Détails</th></tr></thead>
                        <tbody>
                          {searchedDepartures.length === 0 && <tr><td colSpan={10} className="no-data">Aucun départ trouvé.</td></tr>}
                          {searchedDepartures.map(dep => (
                            <tr key={dep.key} onClick={() => setSelectedSearchDepartureKey(dep.key)} style={{ cursor: "pointer", background: selectedSearchDepartureKey === dep.key ? "rgba(245,208,32,.08)" : "" }}>
                              <td>{fmtDateFr(dep.date)}</td>
                              <td><span className="badge badge-gray">{dep.order}e</span></td>
                              <td>{dep.heure}</td>
                              <td>{dep.chauffeur || "—"}</td>
                              <td style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12 }}>{dep.carMatricule}</td>
                              <td style={{ fontSize: 12 }}>{dep.trajet}</td>
                              <td><b>{dep.soldCount}</b></td>
                              <td><b style={{ color: "#4ade80" }}>{fmtFcfa(dep.soldAmount)}</b></td>
                              <td style={{ color: "#f87171" }}>{fmtFcfa(dep.fuelAmount)}</td>
                              <td>
                                {(isManager || isAdmin) && (
                                  <button className="btn btn-blue btn-sm" onClick={e => { e.stopPropagation(); const route = routes.find(r => `${r.depart} → ${r.arrivee}` === dep.trajet)||selectedRoute; const car = route.fleet.find(c => c.carId === dep.carId)||activeCar; printDepartureClosure(route, car, dep.carMatricule, dep.carSerial, dep.date, dep.heure, dep.soldCount, dep.soldAmount, dep.remainingSeats, dep.fuelAmount); }}>🖨 Clôture</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {selectedSearchedDeparture && (
                      <div className="sum-box" style={{ marginTop: 12 }}>
                        <div className="sum-row"><span>Départ sélectionné</span><b>{selectedSearchedDeparture.order}e — {fmtDateFr(selectedSearchedDeparture.date)} {selectedSearchedDeparture.heure}</b></div>
                        <div className="sum-row"><span>Chauffeur</span><b>{selectedSearchedDeparture.chauffeur || "—"}</b></div>
                        <div className="sum-row"><span>Véhicule</span><b>{selectedSearchedDeparture.carId} · {selectedSearchedDeparture.carMatricule}</b></div>
                        <div className="sum-row"><span>Trajet</span><b>{selectedSearchedDeparture.trajet}</b></div>
                        <div className="sum-row"><span>Tickets vendus</span><b>{selectedSearchedDeparture.soldCount}</b></div>
                        <div className="sum-row"><span>Réservations</span><b>{selectedSearchedDeparture.reservedCount}</b></div>
                        <div className="sum-row"><span>Montant vendu</span><b className="amt-green">{fmtFcfa(selectedSearchedDeparture.soldAmount)}</b></div>
                        <div className="sum-row"><span>Carburant</span><b className="amt-red">{fmtFcfa(selectedSearchedDeparture.fuelAmount)}</b></div>
                        <div className="sum-row"><span>Sièges restants</span><b>{selectedSearchedDeparture.remainingSeats}</b></div>
                        <div className="sum-row"><span>Sièges concernés</span><b style={{ fontSize: 12 }}>{selectedSearchedDeparture.seats.sort((a, b) => a - b).join(", ") || "—"}</b></div>
                      </div>
                    )}
                  </div>}
                </div>
              </div>
            </div>
          )}

          {/* ═══ ONGLET RAPPORTS ═══ */}
          {activeTab === "rapports" && (
            <div>
              <div className="section-title">📊 Rapports &amp; Finance</div>
              <div className="grid-main">
                <div className="col">
                  <div className="card">
                    <div className="card-hd">Rapport du jour — {fmtDateFr(travelDate)}</div>
                    <div className="field" style={{ marginBottom: 14 }}><label>Date</label><input type="date" className="inp" value={travelDate} onChange={e => setTravelDate(e.target.value)} /></div>
                    <div className="stat-grid">
                      <div className="stat stat-green"><div className="stat-lbl">Ventes</div><div className="stat-val">{ventesDuJour.length}</div><div className="stat-sub">{fmtFcfa(totalVentes)}</div></div>
                      <div className="stat stat-red"><div className="stat-lbl">Carburant</div><div className="stat-val" style={{ fontSize: 16 }}>{fmtFcfa(totalDepDuJour)}</div></div>
                      <div className={`stat ${benefice >= 0 ? "stat-green" : "stat-red"}`} style={{ gridColumn: "1/-1" }}>
                        <div className="stat-lbl">Bénéfice net</div>
                        <div className="stat-val">{fmtFcfa(benefice)}</div>
                      </div>
                    </div>
                    {(isManager || isAdmin) && (
                      <div className="btn-row" style={{ marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleCloseDayAndSavePdf}>📄 PDF + Clôturer journée</button>
                      </div>
                    )}
                    <p className="info-msg">Le PDF est téléchargé automatiquement puis la journée est verrouillée.</p>
                  </div>

                  <div className="card">
                    <div className="card-hd">Bilan du mois — {travelDate.slice(0, 7)}</div>
                    <div className="stat-grid">
                      <div className="stat stat-blue"><div className="stat-lbl">Ventes mois</div><div className="stat-val">{ventesDuMois.length}</div><div className="stat-sub">{fmtFcfa(totalMois)}</div></div>
                      <div className="stat stat-red"><div className="stat-lbl">Dépenses mois</div><div className="stat-val" style={{ fontSize: 16 }}>{fmtFcfa(totalDepensesMois)}</div></div>
                    </div>
                  </div>
                </div>

                <div className="col" style={{ gridColumn: "2/-1" }}>
                  <div className="card">
                    <div className="card-hd">Sauvegardes PDF journalières</div>
                    <div className="tbl-wrap">
                      <table className="tbl">
                        <thead><tr><th>Date</th><th>Fichier</th><th>Ventes</th><th>Carburant</th><th>Créé le</th></tr></thead>
                        <tbody>
                          {dailyPdfArchives.length === 0 && <tr><td colSpan={5} className="no-data">Aucune sauvegarde PDF.</td></tr>}
                          {dailyPdfArchives.map(a => (
                            <tr key={a.id}>
                              <td>{fmtDateFr(a.date)}</td>
                              <td style={{ fontSize: 12, fontFamily: "JetBrains Mono,monospace" }}>{a.fileName}</td>
                              <td><b>{a.ventesCount}</b> · <span className="amt-green">{fmtFcfa(a.ventesTotal)}</span></td>
                              <td className="amt-red">{fmtFcfa(a.carburantTotal)}</td>
                              <td className="td-muted">{new Date(a.createdAt).toLocaleString("fr-FR")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-hd">Départs du jour — {fmtDateFr(travelDate)}</div>
                    <div className="tbl-wrap">
                      <table className="tbl">
                        <thead><tr><th>Heure</th><th>Trajet</th><th>Chauffeur</th><th>Vendus</th><th>Montant</th><th>Carburant</th></tr></thead>
                        <tbody>
                          {dailyDepartureBreakdown.length === 0 && <tr><td colSpan={6} className="no-data">Aucun départ ce jour.</td></tr>}
                          {dailyDepartureBreakdown.map((d, i) => (
                            <tr key={i}>
                              <td><b>{d.heure}</b></td>
                              <td style={{ fontSize: 12 }}>{d.trajet}</td>
                              <td>{d.chauffeur || "—"}</td>
                              <td><b>{d.ticketsVendus}</b></td>
                              <td className="amt-green"><b>{fmtFcfa(d.montantVendu)}</b></td>
                              <td className="amt-red">{fmtFcfa(d.carburant)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ONGLET ADMIN ═══ */}
          {activeTab === "admin" && (
            <div>
              <div className="section-title">⚙️ Administration</div>
              {!isAdmin ? (
                <div className="card" style={{ maxWidth: 500 }}>
                  <div className="card-hd">🔒 Accès restreint</div>
                  <p className="info-msg">Cette section est réservée à l'administrateur. Cliquez sur le bouton "Admin" dans la barre de navigation pour vous authentifier.</p>
                  <div className="btn-row">
                    <button className="btn btn-admin" onClick={handleAdminLogin}>⚙️ Connexion administrateur</button>
                  </div>
                </div>
              ) : (
                <AdminPanel
                  agencies={agencies} routes={routes} enterpriseUsers={enterpriseUsers} cashDesks={cashDesks}
                  selectedAgencyId={selectedAgencyId} setSelectedAgencyId={setSelectedAgencyId}
                  selectedRouteId={selectedRouteId} setSelectedRouteId={setSelectedRouteId}
                  selectedCashDeskId={selectedCashDeskId}
                  agencyUsers={agencyUsers} agencyCashDesks={agencyCashDesks} selectedAgency={selectedAgency}
                  adminAgencyName={adminAgencyName} setAdminAgencyName={setAdminAgencyName}
                  adminAgencyCity={adminAgencyCity} setAdminAgencyCity={setAdminAgencyCity}
                  adminDepart={adminDepart} setAdminDepart={setAdminDepart}
                  adminArrivee={adminArrivee} setAdminArrivee={setAdminArrivee}
                  adminPrix={adminPrix} setAdminPrix={setAdminPrix}
                  adminHoraires={adminHoraires} setAdminHoraires={setAdminHoraires}
                  newRouteDepart={newRouteDepart} setNewRouteDepart={setNewRouteDepart}
                  newRouteArrivee={newRouteArrivee} setNewRouteArrivee={setNewRouteArrivee}
                  newRoutePrix={newRoutePrix} setNewRoutePrix={setNewRoutePrix}
                  newRouteHoraires={newRouteHoraires} setNewRouteHoraires={setNewRouteHoraires}
                  newCashDeskLabel={newCashDeskLabel} setNewCashDeskLabel={setNewCashDeskLabel}
                  deskCanSell={deskCanSell} setDeskCanSell={setDeskCanSell}
                  deskCanReserve={deskCanReserve} setDeskCanReserve={setDeskCanReserve}
                  deskCanPrintReserve={deskCanPrintReserve} setDeskCanPrintReserve={setDeskCanPrintReserve}
                  deskCanCancelReserve={deskCanCancelReserve} setDeskCanCancelReserve={setDeskCanCancelReserve}
                  newUserFullName={newUserFullName} setNewUserFullName={setNewUserFullName}
                  newUsername={newUsername} setNewUsername={setNewUsername}
                  newPassword={newPassword} setNewPassword={setNewPassword}
                  newUserRole={newUserRole} setNewUserRole={setNewUserRole}
                  newUserAgencyId={newUserAgencyId} setNewUserAgencyId={setNewUserAgencyId}
                  newAgencyName={newAgencyName} setNewAgencyName={setNewAgencyName}
                  newAgencyCity={newAgencyCity} setNewAgencyCity={setNewAgencyCity}
                  newAgencyGuichet={newAgencyGuichet} setNewAgencyGuichet={setNewAgencyGuichet}
                  editUserId={editUserId} setEditUserId={setEditUserId}
                  editUserData={editUserData} setEditUserData={setEditUserData}
                  selectedCashDesk={selectedCashDesk}
                  onUpdateAgency={handleUpdateAgency} onAddAgency={handleAddAgency} onDeleteAgency={handleDeleteAgency}
                  onUpdateRoute={handleUpdateSelectedRoute} onAddRoute={handleAddRoute} onDeleteRoute={handleDeleteSelectedRoute}
                  onCreateCashDesk={handleCreateCashDesk} onToggleCashDesk={toggleCashDesk} onUpdateCashDeskPerms={handleUpdateCashDeskPermissions}
                  onCreateUser={handleCreateEnterpriseUser} onToggleUser={toggleEnterpriseUser} onDeleteUser={handleDeleteUser} onSaveEditUser={handleSaveEditUser}
                  fmtFcfa={fmtFcfa}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
    </LicenceGate>
  );
}

// ─── ADMIN PANEL COMPONENT ────────────────────────────────────────────────────

function AdminPanel(props: {
  agencies: Agency[]; routes: Route[]; enterpriseUsers: AppUser[]; cashDesks: CashDesk[];
  selectedAgencyId: string; setSelectedAgencyId: (v: string) => void;
  selectedRouteId: number; setSelectedRouteId: (v: number) => void;
  selectedCashDeskId: string;
  agencyUsers: AppUser[]; agencyCashDesks: CashDesk[]; selectedAgency: Agency;
  adminAgencyName: string; setAdminAgencyName: (v: string) => void;
  adminAgencyCity: string; setAdminAgencyCity: (v: string) => void;
  adminDepart: string; setAdminDepart: (v: string) => void;
  adminArrivee: string; setAdminArrivee: (v: string) => void;
  adminPrix: number; setAdminPrix: (v: number) => void;
  adminHoraires: string; setAdminHoraires: (v: string) => void;
  newRouteDepart: string; setNewRouteDepart: (v: string) => void;
  newRouteArrivee: string; setNewRouteArrivee: (v: string) => void;
  newRoutePrix: number; setNewRoutePrix: (v: number) => void;
  newRouteHoraires: string; setNewRouteHoraires: (v: string) => void;
  newCashDeskLabel: string; setNewCashDeskLabel: (v: string) => void;
  deskCanSell: boolean; setDeskCanSell: (v: boolean) => void;
  deskCanReserve: boolean; setDeskCanReserve: (v: boolean) => void;
  deskCanPrintReserve: boolean; setDeskCanPrintReserve: (v: boolean) => void;
  deskCanCancelReserve: boolean; setDeskCanCancelReserve: (v: boolean) => void;
  newUserFullName: string; setNewUserFullName: (v: string) => void;
  newUsername: string; setNewUsername: (v: string) => void;
  newPassword: string; setNewPassword: (v: string) => void;
  newUserRole: "vendeur" | "gestionnaire"; setNewUserRole: (v: "vendeur" | "gestionnaire") => void;
  newUserAgencyId: string; setNewUserAgencyId: (v: string) => void;
  newAgencyName: string; setNewAgencyName: (v: string) => void;
  newAgencyCity: string; setNewAgencyCity: (v: string) => void;
  newAgencyGuichet: string; setNewAgencyGuichet: (v: string) => void;
  editUserId: string | null; setEditUserId: (v: string | null) => void;
  editUserData: Partial<AppUser>; setEditUserData: (v: Partial<AppUser>) => void;
  selectedCashDesk: CashDesk | null;
  onUpdateAgency: () => void; onAddAgency: () => void; onDeleteAgency: (id: string) => void;
  onUpdateRoute: () => void; onAddRoute: () => void; onDeleteRoute: () => void;
  onCreateCashDesk: () => void; onToggleCashDesk: (id: string) => void; onUpdateCashDeskPerms: () => void;
  onCreateUser: () => void; onToggleUser: (id: string) => void; onDeleteUser: (id: string) => void; onSaveEditUser: () => void;
  fmtFcfa: (v: number) => string;
}) {
  const [adminTab, setAdminTab] = useState<"agences" | "trajets" | "caisses" | "utilisateurs" | "chauffeurs" | "vehicules">("agences");
  const [chauffeursAdmin, setChauffeursAdmin] = useState<{id:string;nom:string;bus_id:string}[]>([]);
  const [newDriverName, setNewDriverName] = useState("");
  const reloadChauffeursAdmin = () => { apiJson("/api/chauffeurs").then((d:any)=>setChauffeursAdmin(Array.isArray(d)?d:[])).catch(()=>{}); };
  useEffect(() => { reloadChauffeursAdmin(); }, []);
  const addChauffeurAdmin = async () => {
    const nom = newDriverName.trim();
    if (nom.length < 2) { alert("Nom du chauffeur requis."); return; }
    const id = "CH-" + Date.now().toString(36).toUpperCase();
    try { await apiJson("/api/chauffeurs", { method:"POST", body: JSON.stringify({ id, nom }) }); setNewDriverName(""); reloadChauffeursAdmin(); }
    catch(err:any){ alert("Erreur: " + (err?.message||err)); }
  };
  const editChauffeurAdmin = async (id: string, ancien: string) => {
    const nom = (window.prompt("Nouveau nom du chauffeur :", ancien) || "").trim();
    if (!nom || nom === ancien) return;
    try { await apiJson("/api/chauffeurs/" + encodeURIComponent(id), { method:"PATCH", body: JSON.stringify({ nom }) }); reloadChauffeursAdmin(); }
    catch(err:any){ alert("Erreur: " + (err?.message||err)); }
  };
  const deleteChauffeurAdmin = async (id: string, nom: string) => {
    if (!window.confirm("Supprimer le chauffeur \"" + nom + "\" ?")) return;
    try { await apiJson("/api/chauffeurs/" + encodeURIComponent(id), { method:"DELETE" }); reloadChauffeursAdmin(); }
    catch(err:any){ alert("Erreur: " + (err?.message||err)); }
  };
  const [vehicules, setVehicules] = useState<{id:string;marque:string;modele:string;immatriculation:string;nb_places:number;chauffeur_id:string}[]>([]);
  const [vMarque, setVMarque] = useState("");
  const [vModele, setVModele] = useState("");
  const [vImmat, setVImmat] = useState("");
  const [vPlaces, setVPlaces] = useState("65");
  const reloadVehicules = () => { apiJson("/api/vehicules").then((d:any)=>setVehicules(Array.isArray(d)?d:[])).catch(()=>{}); };
  useEffect(() => { reloadVehicules(); }, []);
  const addVehicule = async () => {
    if (!vMarque.trim() && !vImmat.trim()) { alert("Renseignez au moins la marque et l'immatriculation."); return; }
    const id = "V-" + Date.now().toString(36).toUpperCase();
    try { await apiJson("/api/vehicules", { method:"POST", body: JSON.stringify({ id, marque: vMarque.trim(), modele: vModele.trim(), immatriculation: vImmat.trim(), nb_places: parseInt(vPlaces)||65 }) }); setVMarque(""); setVModele(""); setVImmat(""); setVPlaces("65"); reloadVehicules(); }
    catch(err:any){ alert("Erreur: " + (err?.message||err)); }
  };
  const editVehicule = async (v:any) => {
    const immatriculation = (window.prompt("Immatriculation :", v.immatriculation) || "").trim();
    if (!immatriculation) return;
    const places = (window.prompt("Nombre de places :", String(v.nb_places)) || "").trim();
    try { await apiJson("/api/vehicules/" + encodeURIComponent(v.id), { method:"PATCH", body: JSON.stringify({ immatriculation, nb_places: parseInt(places)||v.nb_places }) }); reloadVehicules(); }
    catch(err:any){ alert("Erreur: " + (err?.message||err)); }
  };
  const deleteVehicule = async (id:string, label:string) => {
    if (!window.confirm("Supprimer le véhicule \"" + label + "\" ?")) return;
    try { await apiJson("/api/vehicules/" + encodeURIComponent(id), { method:"DELETE" }); reloadVehicules(); }
    catch(err:any){ alert("Erreur: " + (err?.message||err)); }
  };
  const { agencies, routes, enterpriseUsers, cashDesks, agencyUsers, agencyCashDesks, selectedAgency, selectedCashDesk, fmtFcfa } = props;

  const selectedRoute = routes.find(r => r.id === props.selectedRouteId) ?? routes[0];

  const adminTabs = [
    { id: "agences" as const, label: "🏢 Agences" },
    { id: "trajets" as const, label: "🚌 Trajets & Horaires" },
    { id: "caisses" as const, label: "🏪 Caisses vendeurs" },
    { id: "utilisateurs" as const, label: "👤 Utilisateurs" },
    { id: "chauffeurs" as const, label: "🧑 Chauffeurs" },
    { id: "vehicules" as const, label: "🚌 Véhicules" },
  ];

  return (
    <div className="admin-section">
      <div className="admin-tabs">
        {adminTabs.map(t => (
          <button key={t.id} className={`admin-tab ${adminTab === t.id ? "at-active" : ""}`} onClick={() => setAdminTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* VEHICULES */}
      {adminTab === "vehicules" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-hd">Ajouter un véhicule</div>
            <div className="field"><label>Marque</label><input className="inp" value={vMarque} onChange={e=>setVMarque(e.target.value)} placeholder="Ex: Mercedes" /></div>
            <div className="field"><label>Modèle</label><input className="inp" value={vModele} onChange={e=>setVModele(e.target.value)} placeholder="Ex: Sprinter" /></div>
            <div className="field"><label>Immatriculation</label><input className="inp" value={vImmat} onChange={e=>setVImmat(e.target.value)} placeholder="Ex: AB-1234-CI" /></div>
            <div className="field"><label>Nombre de sièges</label><input className="inp" type="number" value={vPlaces} onChange={e=>setVPlaces(e.target.value)} placeholder="65" /></div>
            <div className="btn-row"><button className="btn btn-primary" onClick={addVehicule}>+ Ajouter véhicule</button></div>
          </div>
          <div className="card" style={{ gridColumn: "1/-1" }}>
            <div className="card-hd">Tous les véhicules ({vehicules.length})</div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Marque</th><th>Modèle</th><th>Immatriculation</th><th>Places</th><th>Actions</th></tr></thead>
                <tbody>
                  {vehicules.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign:"center", color:"#64748b" }}>Aucun véhicule enregistré.</td></tr>
                    : vehicules.map(v => <tr key={v.id}><td><b>{v.marque}</b></td><td>{v.modele}</td><td style={{ fontFamily:"JetBrains Mono,monospace" }}>{v.immatriculation}</td><td>{v.nb_places}</td><td><button className="btn btn-sm" onClick={()=>editVehicule(v)}>✏️ Modifier</button> <button className="btn btn-sm btn-danger" onClick={()=>deleteVehicule(v.id, v.marque+" "+v.immatriculation)}>🗑 Supprimer</button></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHAUFFEURS */}
      {adminTab === "chauffeurs" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-hd">Ajouter un chauffeur</div>
            <div className="field"><label>Nom complet du chauffeur</label><input className="inp" value={newDriverName} onChange={e => setNewDriverName(e.target.value)} placeholder="Ex: KOUASSI Jean" /></div>
            <div className="btn-row"><button className="btn btn-primary" onClick={addChauffeurAdmin}>+ Ajouter chauffeur</button></div>
          </div>
          <div className="card" style={{ gridColumn: "1/-1" }}>
            <div className="card-hd">Tous les chauffeurs ({chauffeursAdmin.length})</div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Nom</th><th>Identifiant</th><th>Actions</th></tr></thead>
                <tbody>
                  {chauffeursAdmin.length === 0
                    ? <tr><td colSpan={3} style={{ textAlign:"center", color:"#64748b" }}>Aucun chauffeur enregistré.</td></tr>
                    : chauffeursAdmin.map(c => <tr key={c.id}><td><b>{c.nom}</b></td><td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12 }}>{c.id}</td><td><button className="btn btn-sm" onClick={() => editChauffeurAdmin(c.id, c.nom)}>✏️ Modifier</button> <button className="btn btn-sm btn-danger" onClick={() => deleteChauffeurAdmin(c.id, c.nom)}>🗑 Supprimer</button></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AGENCES */}
      {adminTab === "agences" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-hd">Modifier une agence</div>
            <div className="field"><label>Agence à modifier</label>
              <select className="sel" value={props.selectedAgencyId} onChange={e => props.setSelectedAgencyId(e.target.value)}>
                {agencies.map(a => <option key={a.id} value={a.id}>{a.name} · {a.city}</option>)}
              </select>
            </div>
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="field"><label>Nom agence</label><input className="inp" value={props.adminAgencyName} onChange={e => props.setAdminAgencyName(e.target.value)} /></div>
              <div className="field"><label>Ville agence</label><input className="inp" value={props.adminAgencyCity} onChange={e => props.setAdminAgencyCity(e.target.value)} /></div>
            </div>
            <div className="btn-row">
              <button className="btn btn-green" onClick={props.onUpdateAgency}>✓ Modifier agence</button>
              <button className="btn btn-red" onClick={() => props.onDeleteAgency(props.selectedAgencyId)}>🗑 Supprimer</button>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">Ajouter une agence</div>
            <div className="grid-2">
              <div className="field"><label>Nom agence</label><input className="inp" value={props.newAgencyName} onChange={e => props.setNewAgencyName(e.target.value)} placeholder="Ex: Agence Yamoussoukro" /></div>
              <div className="field"><label>Ville</label><input className="inp" value={props.newAgencyCity} onChange={e => props.setNewAgencyCity(e.target.value)} placeholder="Ex: Yamoussoukro" /></div>
              <div className="field" style={{ gridColumn: "1/-1" }}><label>Code guichet (optionnel)</label><input className="inp" value={props.newAgencyGuichet} onChange={e => props.setNewAgencyGuichet(e.target.value)} placeholder="Ex: POSTE-YMK-01" /></div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={props.onAddAgency}>+ Ajouter agence</button>
            </div>
          </div>

          <div className="card" style={{ gridColumn: "1/-1" }}>
            <div className="card-hd">Toutes les agences</div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Nom</th><th>Ville</th><th>Guichet</th><th>Utilisateurs</th><th>Caisses</th></tr></thead>
                <tbody>
                  {agencies.map(a => (
                    <tr key={a.id}>
                      <td><b>{a.name}</b></td>
                      <td>{a.city}</td>
                      <td style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12 }}>{a.guichetId}</td>
                      <td>{enterpriseUsers.filter(u => u.agencyId === a.id).length}</td>
                      <td>{cashDesks.filter(c => c.agencyId === a.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TRAJETS */}
      {adminTab === "trajets" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-hd">Modifier un trajet</div>
            <div className="field"><label>Trajet à modifier</label>
              <select className="sel" value={props.selectedRouteId} onChange={e => props.setSelectedRouteId(Number(e.target.value))}>
                {routes.map(r => <option key={r.id} value={r.id}>{r.depart} → {r.arrivee} · {fmtFcfa(r.prix)}</option>)}
              </select>
            </div>
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="field"><label>Départ</label><input className="inp" value={props.adminDepart} onChange={e => props.setAdminDepart(e.target.value)} /></div>
              <div className="field"><label>Arrivée</label><input className="inp" value={props.adminArrivee} onChange={e => props.setAdminArrivee(e.target.value)} /></div>
              <div className="field"><label>Prix (FCFA)</label><input type="number" className="inp" value={props.adminPrix || ""} onChange={e => props.setAdminPrix(Number(e.target.value))} /></div>
              <div className="field"><label>Heures de départ</label><input className="inp" value={props.adminHoraires} onChange={e => props.setAdminHoraires(e.target.value)} placeholder="06:00, 10:00, 14:00" /></div>
            </div>
            <div className="btn-row">
              <button className="btn btn-green" onClick={props.onUpdateRoute}>✓ Modifier trajet</button>
              <button className="btn btn-red" onClick={props.onDeleteRoute}>🗑 Supprimer</button>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">Ajouter un trajet</div>
            <div className="grid-2">
              <div className="field"><label>Départ</label><input className="inp" value={props.newRouteDepart} onChange={e => props.setNewRouteDepart(e.target.value)} /></div>
              <div className="field"><label>Arrivée</label><input className="inp" value={props.newRouteArrivee} onChange={e => props.setNewRouteArrivee(e.target.value)} /></div>
              <div className="field"><label>Prix (FCFA)</label><input type="number" className="inp" value={props.newRoutePrix || ""} onChange={e => props.setNewRoutePrix(Number(e.target.value))} /></div>
              <div className="field"><label>Heures de départ</label><input className="inp" value={props.newRouteHoraires} onChange={e => props.setNewRouteHoraires(e.target.value)} placeholder="06:00, 10:00" /></div>
            </div>
            <div className="btn-row"><button className="btn btn-primary" onClick={props.onAddRoute}>+ Ajouter trajet</button></div>
          </div>

          <div className="card" style={{ gridColumn: "1/-1" }}>
            <div className="card-hd">Tous les trajets ({routes.length})</div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>#</th><th>Départ</th><th>Arrivée</th><th>Prix</th><th>Horaires</th><th>Jours</th></tr></thead>
                <tbody>
                  {routes.map(r => (
                    <tr key={r.id} onClick={() => props.setSelectedRouteId(r.id)} style={{ cursor: "pointer", background: r.id === props.selectedRouteId ? "rgba(245,208,32,.08)" : "" }}>
                      <td className="td-muted">{r.id}</td>
                      <td><b>{r.depart}</b></td>
                      <td>{r.arrivee}</td>
                      <td className="amt-green"><b>{fmtFcfa(r.prix)}</b></td>
                      <td style={{ fontSize: 12 }}>{r.horaires.join(", ")}</td>
                      <td>{r.daysOfWeek ? <span className="badge badge-blue">{r.daysOfWeek.join(", ")}</span> : <span className="badge badge-gray">Tous les jours</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CAISSES */}
      {adminTab === "caisses" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-hd">Ajouter une caisse</div>
            <div className="field"><label>Agence</label>
              <select className="sel" value={props.selectedAgencyId} onChange={e => props.setSelectedAgencyId(e.target.value)}>
                {props.agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="field" style={{ marginTop: 8 }}><label>Nom de la caisse</label>
              <input className="inp" value={props.newCashDeskLabel} onChange={e => props.setNewCashDeskLabel(e.target.value)} placeholder="Ex: Caisse 2" />
            </div>
            <div className="btn-row"><button className="btn btn-primary" onClick={props.onCreateCashDesk}>+ Ajouter caisse</button></div>
          </div>

          <div className="card">
            <div className="card-hd">Permissions caisse sélectionnée</div>
            {selectedCashDesk ? (
              <>
                <div className="sum-box">
                  <div className="sum-row"><span>Caisse</span><b>{selectedCashDesk.label}</b></div>
                  <div className="sum-row"><span>Agence</span><b>{selectedAgency.name}</b></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                  {[
                    { key: "canSell", label: "Vente autorisée", val: props.deskCanSell, set: props.setDeskCanSell },
                    { key: "canReserve", label: "Réservation autorisée", val: props.deskCanReserve, set: props.setDeskCanReserve },
                    { key: "canPrintReserve", label: "Impression réservation", val: props.deskCanPrintReserve, set: props.setDeskCanPrintReserve },
                    { key: "canCancelReserve", label: "Annulation réservation", val: props.deskCanCancelReserve, set: props.setDeskCanCancelReserve },
                  ].map(p => (
                    <label key={p.key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#e2e8f0", fontSize: 14 }}>
                      <input type="checkbox" checked={p.val} onChange={e => p.set(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#f5d020" }} />
                      {p.label}
                    </label>
                  ))}
                </div>
                <div className="btn-row"><button className="btn btn-green" onClick={props.onUpdateCashDeskPerms}>✓ Enregistrer permissions</button></div>
              </>
            ) : <p className="info-msg">Sélectionnez une caisse dans la liste.</p>}
          </div>

          <div className="card" style={{ gridColumn: "1/-1" }}>
            <div className="card-hd">Toutes les caisses</div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Caisse</th><th>Agence</th><th>Vente</th><th>Réservation</th><th>Impression</th><th>Annulation</th><th>État</th><th>Action</th></tr></thead>
                <tbody>
                  {cashDesks.length === 0 && <tr><td colSpan={8} className="no-data">Aucune caisse configurée.</td></tr>}
                  {cashDesks.map(c => {
                    const agency = props.agencies.find(a => a.id === c.agencyId);
                    return (
                      <tr key={c.id}>
                        <td><b>{c.label}</b></td>
                        <td>{agency?.name || c.agencyId}</td>
                        <td>{c.canSell ? "✓" : "✗"}</td>
                        <td>{c.canReserve ? "✓" : "✗"}</td>
                        <td>{c.canPrintReserve ? "✓" : "✗"}</td>
                        <td>{c.canCancelReserve ? "✓" : "✗"}</td>
                        <td><span className={`badge ${c.isActive ? "badge-green" : "badge-red"}`}>{c.isActive ? "Active" : "Bloquée"}</span></td>
                        <td><button className="btn btn-ghost btn-sm" onClick={() => props.onToggleCashDesk(c.id)}>{c.isActive ? "Bloquer" : "Activer"}</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* UTILISATEURS */}
      {adminTab === "utilisateurs" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-hd">Créer un utilisateur</div>
            <div className="grid-2">
              <div className="field" style={{ gridColumn: "1/-1" }}><label>Agence</label>
                <select className="sel" value={props.newUserAgencyId} onChange={e => props.setNewUserAgencyId(e.target.value)}>
                  {props.agencies.map(a => <option key={a.id} value={a.id}>{a.name} · {a.city}</option>)}
                </select>
              </div>
              <div className="field"><label>Nom complet</label><input className="inp" value={props.newUserFullName} onChange={e => props.setNewUserFullName(e.target.value)} placeholder="Prénom Nom" /></div>
              <div className="field"><label>Identifiant</label><input className="inp" value={props.newUsername} onChange={e => props.setNewUsername(e.target.value)} placeholder="login" /></div>
              <div className="field"><label>Mot de passe</label><input className="inp" value={props.newPassword} onChange={e => props.setNewPassword(e.target.value)} placeholder="••••••" /></div>
              <div className="field"><label>Rôle</label>
                <select className="sel" value={props.newUserRole} onChange={e => props.setNewUserRole(e.target.value as "vendeur" | "gestionnaire")}>
                  <option value="vendeur">Vendeur</option>
                  <option value="gestionnaire">Gestionnaire</option>
                </select>
              </div>
            </div>
            <div className="btn-row"><button className="btn btn-primary" onClick={props.onCreateUser}>+ Créer utilisateur</button></div>
          </div>

          {props.editUserId && (
            <div className="card" style={{ border: "1px solid rgba(245,208,32,.4)" }}>
              <div className="card-hd">✏️ Modifier utilisateur</div>
              <div className="grid-2">
                <div className="field"><label>Nom complet</label><input className="inp" value={props.editUserData.fullName || ""} onChange={e => props.setEditUserData({ ...props.editUserData, fullName: e.target.value })} /></div>
                <div className="field"><label>Identifiant</label><input className="inp" value={props.editUserData.username || ""} onChange={e => props.setEditUserData({ ...props.editUserData, username: e.target.value })} /></div>
                <div className="field"><label>Mot de passe</label><input className="inp" value={props.editUserData.password || ""} onChange={e => props.setEditUserData({ ...props.editUserData, password: e.target.value })} /></div>
                <div className="field"><label>Rôle</label>
                  <select className="sel" value={props.editUserData.role || "vendeur"} onChange={e => props.setEditUserData({ ...props.editUserData, role: e.target.value as "vendeur" | "gestionnaire" })}>
                    <option value="vendeur">Vendeur</option>
                    <option value="gestionnaire">Gestionnaire</option>
                  </select>
                </div>
                <div className="field"><label>Agence</label>
                  <select className="sel" value={props.editUserData.agencyId || ""} onChange={e => props.setEditUserData({ ...props.editUserData, agencyId: e.target.value })}>
                    {props.agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="btn-row">
                <button className="btn btn-green" onClick={props.onSaveEditUser}>✓ Enregistrer</button>
                <button className="btn btn-ghost" onClick={() => { props.setEditUserId(null); props.setEditUserData({}); }}>Annuler</button>
              </div>
            </div>
          )}

          <div className="card" style={{ gridColumn: "1/-1" }}>
            <div className="card-hd">Tous les utilisateurs ({enterpriseUsers.length})</div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Nom complet</th><th>Login</th><th>Rôle</th><th>Agence</th><th>État</th><th>Actions</th></tr></thead>
                <tbody>
                  {enterpriseUsers.length === 0 && <tr><td colSpan={6} className="no-data">Aucun utilisateur.</td></tr>}
                  {enterpriseUsers.map(u => {
                    const agency = props.agencies.find(a => a.id === u.agencyId);
                    return (
                      <tr key={u.id}>
                        <td><b>{u.fullName}</b></td>
                        <td style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12 }}>{u.username}</td>
                        <td><span className={`badge ${u.role === "gestionnaire" ? "badge-blue" : "badge-gray"}`}>{u.role}</span></td>
                        <td>{agency?.name || u.agencyId}</td>
                        <td><span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`}>{u.isActive ? "Actif" : "Bloqué"}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { props.setEditUserId(u.id); props.setEditUserData({ ...u }); }}>✏️</button>
                            <button className="btn btn-blue btn-sm" onClick={() => props.onToggleUser(u.id)}>{u.isActive ? "Bloquer" : "Activer"}</button>
                            <button className="btn btn-red btn-sm" onClick={() => props.onDeleteUser(u.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}