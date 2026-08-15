/**
 * Client-side cloud persistence for the Kool Fit AI store.
 *
 * The database is no longer reachable from the browser: every read/write goes
 * through authenticated server functions, so app data (accounts, health
 * reports, logs, leads…) is never exposed to anonymous visitors.
 */
import { cloudAuthenticate, cloudLoad, cloudSave } from "./cloud.functions";

type AnyRec = Record<string, unknown>;

export type CloudSnapshot = {
  users: AnyRec[];
  gyms: AnyRec[];
  requests: AnyRec[];
  leads: AnyRec[];
  checkins: AnyRec[];
  notifications: AnyRec[];
  healthIssues: AnyRec[];
  products: AnyRec[];
  workoutChecklist: AnyRec[];
  dietChecklist: AnyRec[];
};

const TOKEN_KEY = "koolfit-session";

export function getSessionToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function setSessionToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  setSessionToken("");
}

/** Verify credentials on the server (or register a new account) and store the session. */
export async function cloudSignIn(v: {
  email: string;
  passwordHash: string;
  allowCreate?: boolean;
  userId?: string;
}): Promise<{ ok: boolean; error?: string; userId?: string; mustReset?: boolean }> {
  try {
    const res = await cloudAuthenticate({
      data: {
        email: v.email,
        passwordHash: v.passwordHash,
        allowCreate: v.allowCreate ?? false,
        userId: v.userId ?? "",
      },
    });
    if (res.ok) setSessionToken(res.token);
    return { ok: res.ok, error: res.error || undefined, userId: res.userId, mustReset: res.mustReset };
  } catch {
    return { ok: false, error: "Cannot reach the server right now" };
  }
}

/** Pull everything back out of the database. Returns null when signed out / offline. */
export async function loadCloudSnapshot(): Promise<CloudSnapshot | null> {
  const token = getSessionToken();
  if (!token) return null;
  try {
    const json = await cloudLoad({ data: { token } });
    return json ? (JSON.parse(json) as CloudSnapshot) : null;
  } catch {
    return null;
  }
}

/** Push the full state to the database. Safe to call often (debounced by caller). */
export async function saveCloudSnapshot(snapshot: CloudSnapshot): Promise<void> {
  const token = getSessionToken();
  if (!token) return;
  try {
    await cloudSave({ data: { token, snapshot: JSON.stringify(snapshot) } });
  } catch {
    /* offline — local cache keeps the app usable */
  }
}
