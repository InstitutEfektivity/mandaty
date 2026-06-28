/**
 * Newsletter subscribe endpoint pro kalkulačku mandátů.
 * POST /api/subscribe  { email, name?, consent: true, source }
 *   → vytvoří/ověří kontakt v Twenty CRM (zdroj registrací)
 *   → přihlásí e-mail do Listmonk listu „IE Newsletter" (rozesílka)
 *
 * Tajemství se předávají přes env (na serveru /opt/stack/ie-mandaty/.env),
 * NIKDY nejsou v repu. Služba běží na interní síti ie-infra_internal, takže
 * může mluvit s Twenty i Listmonkem, aniž by klíče opustily server.
 */
import express from "express";

const app = express();
app.use(express.json({ limit: "16kb" }));

const {
  PORT = "8787",
  TWENTY_API_URL,
  TWENTY_API_TOKEN,
  LISTMONK_API_URL,
  LISTMONK_API_USER = "bedrich-mcp",
  LISTMONK_API_TOKEN,
  LISTMONK_LIST_ID = "3",
} = process.env;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const log = (...a) => console.log(new Date().toISOString(), ...a);

app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    twenty: Boolean(TWENTY_API_URL && TWENTY_API_TOKEN),
    listmonk: Boolean(LISTMONK_API_URL && LISTMONK_API_TOKEN),
  }),
);

app.post(["/api/subscribe", "/subscribe"], async (req, res) => {
  try {
    const { email, name = "", consent, source = "mandaty-kalkulacka" } = req.body ?? {};

    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: "Zadejte platný e-mail." });
    }
    if (consent !== true) {
      return res.status(400).json({ error: "Je potřeba souhlas se zpracováním e-mailu." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = String(name).trim().slice(0, 120);

    const [twenty, listmonk] = await Promise.allSettled([
      upsertTwenty(cleanEmail, cleanName, source),
      subscribeListmonk(cleanEmail, cleanName, source),
    ]);

    if (twenty.status === "rejected") log("TWENTY ERROR", twenty.reason?.message ?? twenty.reason);
    if (listmonk.status === "rejected") log("LISTMONK ERROR", listmonk.reason?.message ?? listmonk.reason);

    const ok = [twenty, listmonk].some((r) => r.status === "fulfilled");
    if (!ok) return res.status(502).json({ error: "Registraci se teď nepodařilo uložit. Zkuste to prosím znovu." });

    log("SUBSCRIBE", cleanEmail, "twenty:", twenty.status, "listmonk:", listmonk.status);
    return res.json({ ok: true });
  } catch (e) {
    log("FATAL", e?.message ?? e);
    return res.status(500).json({ error: "Chyba serveru." });
  }
});

/* ── Twenty CRM ────────────────────────────────────────────────────────── */
async function upsertTwenty(email, name, source) {
  if (!TWENTY_API_URL || !TWENTY_API_TOKEN) throw new Error("Twenty not configured");
  const headers = {
    Authorization: `Bearer ${TWENTY_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  // Deduplikace dle e-mailu.
  const q = `${TWENTY_API_URL}/rest/people?filter=emails.primaryEmail[eq]:${encodeURIComponent(email)}&limit=1`;
  const found = await fetch(q, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const people = found?.data?.people ?? found?.data ?? [];
  if (Array.isArray(people) && people.length > 0) return "exists";

  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] ?? email.split("@")[0];
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  // Zdroj (source) se nepřepisuje do standardních polí, aby se neznečistila data;
  // segmentace newsletteru se řeší přes Listmonk (attribs.source). Pokud bude
  // potřeba zdroj i v Twenty, přidat custom pole „source" na Person.
  void source;
  const body = {
    name: { firstName, lastName },
    emails: { primaryEmail: email },
  };
  const r = await fetch(`${TWENTY_API_URL}/rest/people`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Twenty ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return "created";
}

/* ── Listmonk ──────────────────────────────────────────────────────────── */
async function subscribeListmonk(email, name, source) {
  if (!LISTMONK_API_URL || !LISTMONK_API_TOKEN) throw new Error("Listmonk not configured");
  const headers = {
    Authorization: `token ${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`,
    "Content-Type": "application/json",
  };
  const body = {
    email,
    name: name || email,
    status: "enabled",
    lists: [Number(LISTMONK_LIST_ID)],
    // Double opt-in: subscriber zůstane „unconfirmed", Listmonk pošle potvrzovací
    // e-mail s odkazem (list „Newsletter Institutu efektivity" = double opt-in).
    preconfirm_subscriptions: false,
    // Odlišení zdroje pro budoucí segmentaci (zatím jeden list). Listmonk v4
    // ignoruje subscriber-level `tags` při create → segmentujeme přes attribs:
    // segment query `subscribers.attribs->>'source' = 'kalkulacka-mandatu'`.
    attribs: { source, segment: "kalkulacka-mandatu", consent: true, consent_at: new Date().toISOString() },
  };
  const r = await fetch(`${LISTMONK_API_URL}/api/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (r.status === 409) return "exists"; // už existuje – považujeme za úspěch
  if (!r.ok) throw new Error(`Listmonk ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return "created";
}

app.listen(Number(PORT), () => log(`mandaty-api naslouchá na :${PORT}`));
