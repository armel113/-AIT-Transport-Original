// ─── A.I.T Transport — API Client ────────────────────────────────────────────
// Compatible avec server.js (HFSQL_AIT · localhost:4900 · API :3001)

const API_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:3001";

const TOKEN_KEY = "ait_token";

// ─── TIMEOUT (ms) ─────────────────────────────────────────────────────────────
// Si le serveur HFSQL est lent ou le port 4900 bloqué, la requête est annulée.
const DEFAULT_TIMEOUT_MS = 8000; // 8 secondes

// ─── ENDPOINTS CENTRALISÉS ────────────────────────────────────────────────────
// Toutes les URLs en un seul endroit — plus de fautes de frappe dans App.tsx.
export const API = {
  LOGIN:          "/api/login",
  TICKETS:        "/api/tickets",
  UTILISATEURS:   "/api/utilisateurs",
  UTILISATEUR:    (login: string) => `/api/utilisateurs/${encodeURIComponent(login)}`,
  AGENCES:        "/api/agences",
  CAISSES:        "/api/caisses",
  DEPENSES:       "/api/depenses",
  ROUTES:         "/api/routes",
  PING:           "/api/ping",
  DEPARTS:        "/api/departs",
  CLOTURE:        (departId: string) => `/api/departs/${encodeURIComponent(departId)}/cloture`,
} as const;

// ─── TOKEN ────────────────────────────────────────────────────────────────────
// ⚠️  Sécurité : localStorage est vulnérable aux attaques XSS.
//     En production, préférer des cookies HttpOnly gérés côté serveur.
//     Pour cette version locale (LAN agence), localStorage est acceptable
//     à condition que le token JWT ait une durée de vie courte (≤ 8h).

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── FETCH AVEC TIMEOUT ───────────────────────────────────────────────────────

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const token   = getToken();
  const headers = new Headers((options.headers as HeadersInit) || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("Accept"))       headers.set("Accept", "application/json");
  if (token)                        headers.set("Authorization", `Bearer ${token}`);

  // Normalise le path : "/api/tickets" ou "/tickets" → toujours "{API_URL}/api/..."
  const url = path.startsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;

  // AbortController pour le timeout
  const controller  = new AbortController();
  const timerId     = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        `Délai dépassé (${timeoutMs / 1000}s) — serveur injoignable sur ${API_URL}`
      );
    }
    throw err;
  } finally {
    clearTimeout(timerId);
  }
}

// ─── apiJson — appel typé avec extraction d'erreur ───────────────────────────

export async function apiJson<T = unknown>(
  path: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const res  = await apiFetch(path, options, timeoutMs);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data as any)?.error || (data as any)?.message || `Erreur API ${res.status}`
    );
  }
  return data as T;
}

// ─── PING — teste la connectivité avant d'afficher "En ligne" ─────────────────
// Retourne true si le serveur répond en moins de timeoutMs.
// Usage : const ok = await pingServer(); setConnStatus(ok ? "online" : "offline");

export async function pingServer(timeoutMs = 4000): Promise<boolean> {
  try {
    const res = await apiFetch(API.PING, { method: "GET" }, timeoutMs);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

// ─── CLÔTURE DÉPART ───────────────────────────────────────────────────────────
// Appelée par le Vendeur ET le Gestionnaire pour clôturer un car sortant.
// - Le backend vérifie que le token est valide (rôle vendeur ou gestionnaire).
// - En cas d'erreur réseau ou 404 (départ pas encore dans HFSQL), la clôture
//   locale dans App.tsx est quand même effectuée (degraded mode).

export type ClotureResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; status?: number; degraded?: boolean };

export async function cloturerDepart(
  departId: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ClotureResult> {
  try {
    const res  = await apiFetch(API.CLOTURE(departId), { method: "POST" }, timeoutMs);
    const data = await res.json().catch(() => null);

    if (res.ok) {
      return { ok: true, message: (data as any)?.message };
    }

    // 404 → le départ n'existe pas encore dans HFSQL (première vente locale uniquement)
    // On laisse App.tsx faire la clôture locale sans bloquer l'utilisateur.
    if (res.status === 404) {
      return { ok: false, error: "Départ introuvable dans HFSQL — clôture locale effectuée.", status: 404, degraded: true };
    }

    // 401 / 403 → problème de token ou de rôle — on bloque.
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: (data as any)?.error || "Accès non autorisé.", status: res.status };
    }

    return {
      ok: false,
      error: (data as any)?.error || `Erreur serveur HTTP ${res.status}`,
      status: res.status,
    };
  } catch (err) {
    // Timeout ou réseau absent → mode dégradé, clôture locale seulement.
    const msg =
      err instanceof Error ? err.message : "Erreur réseau inconnue";
    return { ok: false, error: msg, degraded: true };
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export async function login(
  username: string,
  password: string
): Promise<{
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    login?: string;
    role: string;
    agencyId?: string;
    fullName?: string;
  };
  error?: string;
}> {
  try {
    const data = await apiJson<any>(API.LOGIN, {
      method: "POST",
      body: JSON.stringify({ username, login: username, password, pin: password }),
    });

    if (data?.token) setToken(data.token);

    // Normalise la réponse → format attendu par App.tsx
    if (data?.user || data?.username || data?.login) {
      const u = data.user || data;
      return {
        success: true,
        token: data.token,
        user: {
          id:       String(u.id       || u.username || u.login   || username),
          username: String(u.username || u.login    || username),
          login:    String(u.login    || u.username || username),
          role:     String(u.role     || "vendeur"),
          agencyId: String(u.agencyId || u.agence_id || "soubre"),
          fullName: String(u.fullName || u.full_name || u.username || u.login || username),
        },
      };
    }

    return { success: false, error: "Réponse serveur invalide" };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de joindre le serveur (port 3001)",
    };
  }
}
