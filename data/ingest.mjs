#!/usr/bin/env node
// @ts-check
/**
 * ingest.mjs — volby.cz open data (komunální volby 2022) → static JSON.
 *
 * Stahuje a parsuje otevřená data ČSÚ (volby.cz, KV 2022) a generuje:
 *   public/data/obce-index.json         — lehký index všech obcí (pro fulltext picker)
 *   public/data/okres/<okresNuts>.json  — detailní balíčky výsledků po okresech
 *   public/data/README.md               — atribuce CC BY 4.0
 *
 * Spuštění: `npm run ingest` (Node 24+, ESM, built-in fetch, full ICU).
 * Závislost: fast-xml-parser (devDependency).
 *
 * Zdroj dat: Český statistický úřad, volby.cz, komunální volby 2022, licence CC BY 4.0.
 */

import { XMLParser } from "fast-xml-parser";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// Cesty
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_DATA = join(ROOT, "public", "data");
const OKRES_DIR = join(PUBLIC_DATA, "okres");
const CACHE_DIR = join(__dirname, ".cache");

const DATUM_VOLEB = "20220923";
const NUTS_URL = "https://www.volby.cz/opendata/kv2022/KV_nuts.htm";
const POP_CSV_URL = "https://www.volby.cz/opendata/kv2022/csv/kvrzcoco.csv";
const OKRES_URL = (nuts) =>
  `https://www.volby.cz/pls/kv2022/vysledky_obce_okres?datumvoleb=${DATUM_VOLEB}&nuts=${nuts}`;

const REQUEST_DELAY_MS = 200;
const MAX_RETRIES = 3;

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Číslo z řetězce: odstraní mezery/NBSP/tisícové oddělovače, čárku → tečka. */
function toNum(v) {
  if (v === undefined || v === null || v === "") return 0;
  const s = String(v).replace(/ /g, "").replace(/\s/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

const collator = new Intl.Collator("cs", { sensitivity: "base" });

/** Stáhne URL jako Buffer s retry + cache. */
async function fetchBuffer(url, cacheName, { retries = MAX_RETRIES } = {}) {
  const cachePath = cacheName ? join(CACHE_DIR, cacheName) : null;
  if (cachePath && existsSync(cachePath)) {
    return await readFile(cachePath);
  }
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (cachePath) await writeFile(cachePath, buf);
      return buf;
    } catch (err) {
      lastErr = err;
      const backoff = 400 * attempt;
      console.warn(`   ! pokus ${attempt}/${retries} selhal (${err.message}); čekám ${backoff} ms`);
      await sleep(backoff);
    }
  }
  throw new Error(`Stažení selhalo po ${retries} pokusech: ${url} (${lastErr?.message})`);
}

// ---------------------------------------------------------------------------
// 1) NUTS seznam okresů (+ kraj názvy)
// ---------------------------------------------------------------------------
/**
 * Parsuje KV_nuts.htm (Excel export, windows-1250). Hierarchie kódů:
 *   délka 5 (CZ0XX)  = kraj  (NUTS-3) — proper názvy „Středočeský kraj"
 *   délka 6 (CZ0XXX) = okres (LAU-1)  — to chceme stahovat
 * Kraj okresu = záznam délky 5, který je prefixem kódu okresu.
 * @returns {{ nuts: string, okres: string, kraj: string }[]}
 */
function parseNuts(buf) {
  const html = new TextDecoder("windows-1250").decode(buf);
  const rows = html.split(/<tr/i).slice(1);

  const codes = []; // { code, name }
  for (const row of rows) {
    const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      m[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim(),
    );
    const codeCell = tds.find((t) => /^CZ[0-9A-Z]+$/.test(t));
    if (!codeCell) continue;
    const ci = tds.indexOf(codeCell);
    const name = tds.slice(ci + 1).find((t) => t.length > 0) || "";
    codes.push({ code: codeCell, name });
  }

  const kraje = new Map(); // CZ0XX -> kraj name
  for (const { code, name } of codes) if (code.length === 5) kraje.set(code, name);

  const okresy = [];
  for (const { code, name } of codes) {
    if (code.length !== 6) continue;
    if (!/^CZ0[0-9A-Z]{3}$/.test(code)) continue;
    const kraj = kraje.get(code.slice(0, 5)) || "";
    okresy.push({ nuts: code, okres: name, kraj });
  }
  return okresy;
}

// ---------------------------------------------------------------------------
// 2) Populace (kvrzcoco.csv, windows-1250, ';' quoted)
// ---------------------------------------------------------------------------
/** Naivní CSV řádek s respektováním uvozovek. */
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ";" && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** @returns {Map<string, number>} KODZASTUP -> POCOBYV */
function parsePopulation(buf) {
  const txt = new TextDecoder("windows-1250").decode(buf);
  const lines = txt.split(/\r?\n/).filter((l) => l.length > 0);
  const header = splitCsvLine(lines[0]);
  const iKod = header.indexOf("KODZASTUP");
  const iPop = header.indexOf("POCOBYV");
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const c = splitCsvLine(lines[i]);
    const kod = c[iKod];
    if (!kod) continue;
    map.set(kod, toNum(c[iPop]));
  }
  return map;
}

// ---------------------------------------------------------------------------
// 3) Výsledky okresu (XML, UTF-8)
// ---------------------------------------------------------------------------
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => name === "OBEC" || name === "VOLEBNI_STRANA",
});

/**
 * Parsuje XML jednoho okresu na pole detailních obcí (jen OZNAC_TYPU="OBEC").
 * @returns {{ details: object[], skipped: number, excludedSub: number }}
 */
function parseOkresXml(buf, meta, popMap) {
  const xml = buf.toString("utf8");
  const parsed = xmlParser.parse(xml);
  const root = parsed.VYSLEDKY_OBCE_OKRES || {};
  const obce = root.OBEC || [];

  const details = [];
  let skipped = 0;
  let excludedSub = 0;

  for (const o of obce) {
    const typ = o["@_OZNAC_TYPU"];
    // Zahrnujeme řádná obecní zastupitelstva (OBEC) i městské části / městské
    // obvody (MCMO – Praha, Brno, Ostrava, Plzeň). Ostatní typy vynecháme.
    if (typ !== "OBEC" && typ !== "MCMO") {
      excludedSub++;
      continue;
    }

    const kod = String(o["@_KODZASTUP"] || "");
    const nazev = o["@_NAZEVZAST"] || "";
    const mandatu = toNum(o["@_VOLENO_ZASTUP"]);

    const vysledek = o.VYSLEDEK || {};
    const ucastEl = vysledek.UCAST;
    const stranyRaw = vysledek.VOLEBNI_STRANA || [];

    // Bez platného výsledku (chybí UCAST nebo žádná strana) → skip.
    if (!ucastEl || stranyRaw.length === 0) {
      skipped++;
      continue;
    }

    const strany = stranyRaw.map((s) => {
      const out = {
        nazev: s["@_NAZEV_STRANY"] || "",
        hlasy: toNum(s["@_HLASY"]),
        mandaty: toNum(s["@_ZASTUPITELE_POCET"]),
      };
      const kand = s["@_KANDIDATU_POCET"];
      if (kand !== undefined && kand !== "") out.kandidatu = toNum(kand);
      return out;
    });

    details.push({
      kod,
      nazev,
      okres: meta.okres,
      kraj: meta.kraj,
      obyvatel: popMap.get(kod) ?? 0,
      mandatu,
      okresNuts: meta.nuts,
      typ: typ === "MCMO" ? "MC" : "OBEC",
      volicu: toNum(ucastEl["@_ZAPSANI_VOLICI"]),
      ucast: toNum(ucastEl["@_UCAST_PROC"]),
      platneHlasy: toNum(ucastEl["@_PLATNE_HLASY"]),
      strany,
    });
  }

  return { details, skipped, excludedSub };
}

// ---------------------------------------------------------------------------
// Hlavní běh
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== ingest KV 2022 → static JSON ===\n");

  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(OKRES_DIR, { recursive: true });

  // 1) NUTS okresy
  console.log("[1/4] NUTS seznam okresů …");
  const nutsBuf = await fetchBuffer(NUTS_URL, "KV_nuts.htm");
  const okresy = parseNuts(nutsBuf);
  console.log(`      ${okresy.length} okresů (vč. krajů názvů)`);

  // 2) Populace
  console.log("[2/4] Populace (kvrzcoco.csv) …");
  const popBuf = await fetchBuffer(POP_CSV_URL, "kvrzcoco.csv");
  const popMap = parsePopulation(popBuf);
  console.log(`      ${popMap.size} záznamů KODZASTUP → POCOBYV`);

  // 3) Výsledky po okresech
  console.log(`[3/4] Výsledky ${okresy.length} okresů …`);
  const index = [];
  let totalObce = 0;
  let totalSkipped = 0;
  let totalExcludedSub = 0;
  let bundles = 0;
  let missingPop = 0;

  for (let i = 0; i < okresy.length; i++) {
    const meta = okresy[i];
    const buf = await fetchBuffer(OKRES_URL(meta.nuts), `okres_${meta.nuts}.xml`);
    const { details, skipped, excludedSub } = parseOkresXml(buf, meta, popMap);

    // okresní balíček
    const sortedDetails = details.slice().sort((a, b) => collator.compare(a.nazev, b.nazev));
    await writeFile(
      join(OKRES_DIR, `${meta.nuts}.json`),
      JSON.stringify(sortedDetails),
      "utf8",
    );
    bundles++;

    for (const d of details) {
      if (d.obyvatel === 0 && !popMap.has(d.kod)) missingPop++;
      index.push({
        kod: d.kod,
        nazev: d.nazev,
        okres: d.okres,
        kraj: d.kraj,
        obyvatel: d.obyvatel,
        mandatu: d.mandatu,
        okresNuts: d.okresNuts,
        typ: d.typ,
      });
    }

    totalObce += details.length;
    totalSkipped += skipped;
    totalExcludedSub += excludedSub;

    process.stdout.write(
      `\r      ${i + 1}/${okresy.length}  ${meta.nuts} ${meta.okres.padEnd(20).slice(0, 20)}  obcí: ${totalObce}   `,
    );

    // zdvořilá prodleva (kromě posledního)
    if (i < okresy.length - 1) await sleep(REQUEST_DELAY_MS);
  }
  process.stdout.write("\n");

  // 4) Zápis indexu + README
  console.log("[4/4] Zápis obce-index.json + README …");
  index.sort((a, b) => collator.compare(a.nazev, b.nazev));
  await writeFile(join(PUBLIC_DATA, "obce-index.json"), JSON.stringify(index), "utf8");

  const readme = `# Data — komunální volby 2022

Statická data pro kalkulačku mandátů. Generováno skriptem \`data/ingest.mjs\`
(\`npm run ingest\`) z otevřených dat ČSÚ.

## Soubory

- \`obce-index.json\` — lehký index všech obcí (obecních zastupitelstev):
  \`{ kod, nazev, okres, kraj, obyvatel, mandatu, okresNuts }\`
- \`okres/<okresNuts>.json\` — detailní výsledky všech obcí v okresu:
  \`{ kod, nazev, okres, kraj, obyvatel, mandatu, okresNuts, volicu, ucast, platneHlasy, strany[] }\`
  kde \`strany[] = { nazev, hlasy, mandaty, kandidatu? }\`.

## Atribuce

**Zdroj dat: Český statistický úřad, volby.cz, komunální volby 2022, licence CC BY 4.0.**

- NUTS seznam okresů: <https://www.volby.cz/opendata/kv2022/KV_nuts.htm>
- Výsledky po okresech: \`https://www.volby.cz/pls/kv2022/vysledky_obce_okres?datumvoleb=${DATUM_VOLEB}&nuts=<NUTS>\`
- Počty obyvatel: <https://www.volby.cz/opendata/kv2022/csv/kvrzcoco.csv>

Zahrnuta jsou pouze řádná obecní zastupitelstva (\`OZNAC_TYPU="OBEC"\`).
Vyloučeny jsou městské části a městské obvody (\`OZNAC_TYPU="MCMO"\` — Praha,
Brno, Ostrava, Plzeň); hlavní město Praha je zahrnuto jako jedno městské
zastupitelstvo (65 mandátů).
`;
  await writeFile(join(PUBLIC_DATA, "README.md"), readme, "utf8");

  // Souhrn
  console.log("\n=== SOUHRN ===");
  console.log(`Okresů (balíčků):       ${bundles}`);
  console.log(`Obcí v indexu:          ${totalObce}`);
  console.log(`Vyloučeno MCMO:         ${totalExcludedSub} (městské části/obvody)`);
  console.log(`Přeskočeno (no result): ${totalSkipped}`);
  console.log(`Bez populace (obyv=0):  ${missingPop}`);

  return { index, bundles, totalObce };
}

main().catch((err) => {
  console.error("\nFATAL:", err);
  process.exit(1);
});
