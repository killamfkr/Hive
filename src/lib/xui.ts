import { getServerEnv, xuiConfigured } from "@/lib/env";

function bouquetArray(): string[] {
  const raw = getServerEnv().XUI_BOUQUET_IDS ?? "1";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function subscriptionExpDate(): string {
  const days = getServerEnv().XUI_SUBSCRIPTION_LENGTH ?? "30";
  if (/^\d+$/.test(days)) return `${days}days`;
  return days;
}

function extractLineId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const candidates = [o.id, o.line_id, o.lineId];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c;
    if (typeof c === "number") return String(c);
  }
  const data = o.data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const id = d.id ?? d.line_id;
    if (typeof id === "string") return id;
    if (typeof id === "number") return String(id);
  }
  return null;
}

async function callAction(
  action: string,
  extra: Record<string, string>
): Promise<{ ok: boolean; json: unknown; text: string; status: number }> {
  const env = getServerEnv();
  if (!xuiConfigured(env)) {
    throw new Error("XUI is not configured (XUI_BASE_URL, XUI_API_KEY)");
  }
  const base = env.XUI_BASE_URL!.replace(/\/$/, "");
  const params = new URLSearchParams({
    api_key: env.XUI_API_KEY!,
    action,
    ...extra,
  });
  const url = `${base}/?${params.toString()}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, json, text, status: res.status };
}

export async function xuiCreateLine(username: string, password: string) {
  const env = getServerEnv();
  const maxConn = env.XUI_MAX_CONNECTIONS ?? "1";
  const bouquets = JSON.stringify(bouquetArray());
  const exp_date = subscriptionExpDate();
  const { ok, json, status, text } = await callAction("create_line", {
    username,
    password,
    max_connections: maxConn,
    bouquets_selected: bouquets,
    exp_date,
  });
  const lineId = extractLineId(json);
  if (!ok || !lineId) {
    console.error("XUI create_line failed", { status, text: text.slice(0, 500) });
    throw new Error("XUI create_line failed — check panel logs and API parameters");
  }
  return { lineId, response: json };
}

export async function xuiRenewLine(lineId: string) {
  const exp_date = subscriptionExpDate();
  const { ok, json, status, text } = await callAction("edit_line", {
    id: lineId,
    exp_date,
  });
  if (!ok) {
    console.error("XUI edit_line (renew) failed", { status, text: text.slice(0, 500) });
    throw new Error("XUI renew failed — verify edit_line supports exp_date on your panel");
  }
  return { response: json };
}
