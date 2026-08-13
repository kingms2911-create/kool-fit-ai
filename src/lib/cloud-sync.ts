/**
 * Cloud persistence for the Kool Fit AI store.
 *
 * The whole app state (accounts, gyms, trainers, members, plans, daily logs,
 * leads, store products, notifications) is mirrored into the backend database
 * so nothing is lost when the app is rebuilt or opened on another device.
 */
import { supabase } from "@/integrations/supabase/client";

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

const str = (v: unknown) => (typeof v === "string" ? v : null);

/** Pull everything back out of the database. Returns null when empty / offline. */
export async function loadCloudSnapshot(): Promise<CloudSnapshot | null> {
  try {
    const [users, gyms, requests, leads, checkins, notifications, issues, products, foodLogs, meta] =
      await Promise.all([
        supabase.from("app_users").select("id,email,role,gym_id,password_hash,data"),
        supabase.from("gyms").select("id,data"),
        supabase.from("plan_requests").select("id,data"),
        supabase.from("leads").select("id,data"),
        supabase.from("checkins").select("id,data"),
        supabase.from("notifications").select("id,data"),
        supabase.from("health_issues").select("id,data"),
        supabase.from("products").select("id,data"),
        supabase.from("food_logs").select("id,member_id,data"),
        supabase.from("app_meta").select("key,data"),
      ]);

    if (users.error || !users.data || users.data.length === 0) return null;

    const logsByMember = new Map<string, AnyRec[]>();
    for (const row of foodLogs.data ?? []) {
      const memberId = str(row.member_id);
      if (!memberId) continue;
      const list = logsByMember.get(memberId) ?? [];
      list.push({ ...(row.data as AnyRec), id: row.id });
      logsByMember.set(memberId, list);
    }

    const rows = (r: { data: { id: string; data: unknown }[] | null }) =>
      (r.data ?? []).map((x) => ({ ...(x.data as AnyRec), id: x.id }));

    const metaRow = (key: string) =>
      ((meta.data ?? []).find((m) => m.key === key)?.data as { items?: AnyRec[] } | undefined)?.items ?? [];

    return {
      users: users.data.map((u) => ({
        ...(u.data as AnyRec),
        id: u.id,
        email: u.email ?? "",
        role: u.role,
        ...(u.gym_id ? { gymId: u.gym_id } : {}),
        password: u.password_hash ?? "",
        foodLog: logsByMember.get(u.id) ?? [],
      })),
      gyms: rows(gyms),
      requests: rows(requests),
      leads: rows(leads),
      checkins: rows(checkins),
      notifications: rows(notifications),
      healthIssues: rows(issues),
      products: rows(products),
      workoutChecklist: metaRow("workoutChecklist"),
      dietChecklist: metaRow("dietChecklist"),
    };
  } catch {
    return null;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function syncTable(table: string, rows: AnyRec[], idKey = "id") {
  const client = supabase as any;
  if (rows.length) {
    await client.from(table).upsert(rows, { onConflict: idKey });
  }
  const ids = rows.map((r) => String(r[idKey]));
  const query = client.from(table).delete();
  await (ids.length ? query.not(idKey, "in", `(${ids.join(",")})`) : query.neq(idKey, "__none__"));
}

/** Push the full state to the database. Safe to call often (debounced by caller). */
export async function saveCloudSnapshot(snapshot: CloudSnapshot): Promise<void> {
  try {
    const foodLogRows: AnyRec[] = [];
    const userRows = snapshot.users.map((u) => {
      const { password, foodLog, ...rest } = u as AnyRec & { password?: string; foodLog?: AnyRec[] };
      for (const entry of foodLog ?? []) {
        foodLogRows.push({ id: String(entry["id"]), member_id: String(u["id"]), data: entry });
      }
      return {
        id: String(u["id"]),
        email: str(u["email"]) ?? "",
        role: str(u["role"]),
        gym_id: str(u["gymId"]),
        password_hash: password ?? "",
        data: rest,
        updated_at: new Date().toISOString(),
      };
    });

    const simple = (rows: AnyRec[], extra: (r: AnyRec) => AnyRec = () => ({})) =>
      rows.map((r) => ({ id: String(r["id"]), data: r, ...extra(r) }));

    await Promise.all([
      syncTable("app_users", userRows),
      syncTable("food_logs", foodLogRows),
      syncTable("gyms", simple(snapshot.gyms)),
      syncTable("plan_requests", simple(snapshot.requests, (r) => ({ member_id: str(r["memberId"]), gym_id: str(r["gymId"]), status: str(r["status"]) }))),
      syncTable("leads", simple(snapshot.leads, (r) => ({ gym_id: str(r["gymId"]), status: str(r["status"]) }))),
      syncTable("checkins", simple(snapshot.checkins, (r) => ({ member_id: str(r["memberId"]), gym_id: str(r["gymId"]) }))),
      syncTable("notifications", simple(snapshot.notifications, (r) => ({ user_id: str(r["userId"]) }))),
      syncTable("health_issues", simple(snapshot.healthIssues, (r) => ({ member_id: str(r["memberId"]), gym_id: str(r["gymId"]) }))),
      syncTable("products", simple(snapshot.products, (r) => ({ scope: str(r["scope"]), gym_id: str(r["gymId"]) }))),
      (supabase as any).from("app_meta").upsert(
        [
          { key: "workoutChecklist", data: { items: snapshot.workoutChecklist } },
          { key: "dietChecklist", data: { items: snapshot.dietChecklist } },
        ],
        { onConflict: "key" },
      ),
    ]);
  } catch {
    /* offline — local cache keeps the app usable */
  }
}

