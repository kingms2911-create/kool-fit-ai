import { createServerFn } from "@tanstack/react-start";
import type { CloudSnapshot } from "./cloud.server";

export const cloudAuthenticate = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; passwordHash: string; allowCreate?: boolean; userId?: string }) => ({
    email: String(data?.email ?? "").slice(0, 200),
    passwordHash: String(data?.passwordHash ?? "").slice(0, 200),
    allowCreate: Boolean(data?.allowCreate),
    userId: data?.userId ? String(data.userId).slice(0, 80) : undefined,
  }))
  .handler(async ({ data }) => {
    const { authenticate } = await import("./cloud.server");
    return authenticate(data);
  });

export const cloudLoad = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => ({ token: String(data?.token ?? "").slice(0, 400) }))
  .handler(async ({ data }) => {
    const { readSnapshot } = await import("./cloud.server");
    return readSnapshot(data.token);
  });

export const cloudSave = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; snapshot: CloudSnapshot }) => ({
    token: String(data?.token ?? "").slice(0, 400),
    snapshot: data.snapshot,
  }))
  .handler(async ({ data }) => {
    const { writeSnapshot } = await import("./cloud.server");
    return writeSnapshot(data.token, data.snapshot);
  });
