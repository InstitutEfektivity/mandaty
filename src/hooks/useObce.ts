import { useEffect, useState, useSyncExternalStore } from "react";

export interface ObecIndexEntry {
  kod: string;
  nazev: string;
  okres: string;
  kraj: string;
  obyvatel: number;
  mandatu: number;
  /** NUTS kód okresu – klíč k detailnímu balíčku /data/okres/<nuts>.json */
  okresNuts: string;
  /** "OBEC" = řádné obecní zastupitelstvo, "MC" = městská část / obvod. */
  typ?: "OBEC" | "MC";
}

export interface ObecStrana {
  nazev: string;
  hlasy: number;
  mandaty: number;
  kandidatu?: number;
}

/** Stav průběžného sčítání (jen u živých dat KV 2026). */
export interface LiveInfo {
  okrskyCelkem: number;
  okrskyZprac: number;
  /** % zpracovaných okrsků (0–100) */
  okrskyProc: number;
  /** ČSÚ označilo zastupitelstvo za spočtené (JE_SPOCTENO="1") */
  spocteno: boolean;
  /** Čas vygenerování souboru ČSÚ (ISO, lokální čas serveru ČSÚ). */
  generovano: string;
  /**
   * Při částečném sečtení je ZAPSANI_VOLICI jen za zpracované okrsky; pak
   * `volicu` doplňujeme z konečných dat 2022 (celá obec), aby kampaňová
   * matematika dávala smysl. true = doplněno z 2022.
   */
  volicuZ2022?: boolean;
}

export interface ObecDetail extends ObecIndexEntry {
  volicu: number;
  ucast: number; // %
  platneHlasy: number;
  strany: ObecStrana[];
  /** Zdroj dat: konečné výsledky 2022 vs. průběžné 2026. */
  zdroj: DataSource;
  live?: LiveInfo;
}

type Status = "loading" | "ready" | "unavailable";

const BASE = import.meta.env.BASE_URL;

/* ── Zdroj dat (sdílený přepínač pro všechny kalkulačky) ─────────────────── */

export type DataSource = "2026" | "2022";

const SOURCE_KEY = "mandaty.dataSource";

function readInitialSource(): DataSource {
  // 1) URL (sdílený odkaz) má přednost, 2) poslední volba v prohlížeči, 3) výchozí 2026.
  try {
    const u = new URLSearchParams(window.location.search).get("zdroj");
    if (u === "2022" || u === "2026") return u;
  } catch {
    /* SSR / testy */
  }
  try {
    const v = localStorage.getItem(SOURCE_KEY);
    if (v === "2022" || v === "2026") return v;
  } catch {
    /* private mode apod. */
  }
  return "2026";
}

/* ── Zapamatovaná obec + naposledy vybrané + sdílený odkaz (?obec=KOD) ─── */

const OBEC_KEY = "mandaty.obec";
const RECENT_KEY = "mandaty.recentObce";
export const RECENT_LIMIT = 7;

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** URL slug obce: „praha-17", „benesov"; při shodě názvů doplněný okresem: „adamov-blansko". */
export function slugify(s: string): string {
  return normalizeText(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function obecSlug(entry: ObecIndexEntry, index: ObecIndexEntry[]): string {
  const base = slugify(entry.nazev);
  const sameName = index.filter((o) => slugify(o.nazev) === base);
  if (sameName.length <= 1) return base;
  const withOkres = `${base}-${slugify(entry.okres)}`;
  const sameNameOkres = sameName.filter((o) => `${base}-${slugify(o.okres)}` === withOkres);
  return sameNameOkres.length <= 1 ? withOkres : `${withOkres}-${entry.kod}`;
}

/** Najde obec podle parametru z URL – přijímá slug (název, název-okres, název-okres-kód) i starý číselný kód. */
export function resolveObecParam(param: string, index: ObecIndexEntry[]): ObecIndexEntry | undefined {
  const p = param.trim();
  if (!p) return undefined;
  if (/^\d{3,7}$/.test(p)) return index.find((o) => o.kod === p);
  const slug = slugify(p);
  const exact = index.filter((o) => slugify(o.nazev) === slug);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return undefined; // nejednoznačné – uživatel vybere ručně
  const kodMatch = /-(\d{3,7})$/.exec(slug);
  if (kodMatch) {
    const byKod = index.find((o) => o.kod === kodMatch[1]);
    if (byKod) return byKod;
  }
  return index.find((o) => `${slugify(o.nazev)}-${slugify(o.okres)}` === slug);
}

/** Parametr obce, kterou máme po načtení stránky automaticky předvyplnit (URL > localStorage). */
export function getInitialObecParam(): string | null {
  try {
    const u = new URLSearchParams(window.location.search).get("obec");
    if (u) return u;
  } catch {
    /* ignore */
  }
  return lsGet(OBEC_KEY);
}

export function getRecentObecKods(): string[] {
  try {
    const arr = JSON.parse(lsGet(RECENT_KEY) ?? "[]");
    return Array.isArray(arr) ? arr.filter((k) => typeof k === "string").slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

/** Zapamatuje vybranou obec (pro reload) a zařadí ji mezi naposledy vybrané. */
export function rememberObec(kod: string) {
  lsSet(OBEC_KEY, kod);
  const recent = [kod, ...getRecentObecKods().filter((k) => k !== kod)].slice(0, RECENT_LIMIT);
  lsSet(RECENT_KEY, JSON.stringify(recent));
}

export function forgetObec() {
  lsSet(OBEC_KEY, null);
}

/** Udržuje v adresním řádku `?obec=praha-17&zdroj=2026`, aby šel výsledek poslat odkazem. */
export function syncUrl(slug: string | null, source: DataSource) {
  try {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set("obec", slug);
      url.searchParams.set("zdroj", source);
    } else {
      url.searchParams.delete("obec");
      url.searchParams.delete("zdroj");
    }
    window.history.replaceState(window.history.state, "", url);
  } catch {
    /* ignore */
  }
}

let currentSource: DataSource = readInitialSource();
const sourceListeners = new Set<() => void>();

export function setDataSource(s: DataSource) {
  if (s === currentSource) return;
  currentSource = s;
  try {
    localStorage.setItem(SOURCE_KEY, s);
  } catch {
    /* ignore */
  }
  sourceListeners.forEach((l) => l());
}

export function useDataSource(): [DataSource, (s: DataSource) => void] {
  const s = useSyncExternalStore(
    (cb) => {
      sourceListeners.add(cb);
      return () => sourceListeners.delete(cb);
    },
    () => currentSource,
    () => currentSource,
  );
  return [s, setDataSource];
}

/* ── Index obcí (statický, z KV 2022) ────────────────────────────────────── */

export function useObceIndex() {
  const [obce, setObce] = useState<ObecIndexEntry[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;
    fetch(`${BASE}data/obce-index.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: ObecIndexEntry[]) => {
        if (!alive) return;
        setObce(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!alive) return;
        setStatus("unavailable");
      });
    return () => {
      alive = false;
    };
  }, []);

  return { obce, status };
}

/* ── Konečné výsledky KV 2022 (statické JSON balíčky) ───────────────────── */

// Cache načtených okresních balíčků (znovuvybrání obce ve stejném okrese = bez fetch).
const okresCache = new Map<string, ObecDetail[]>();

export async function fetchObecDetail(okresNuts: string, kod: string): Promise<ObecDetail | null> {
  try {
    let bundle = okresCache.get(okresNuts);
    if (!bundle) {
      const r = await fetch(`${BASE}data/okres/${okresNuts}.json`);
      if (!r.ok) return null;
      bundle = (await r.json()) as ObecDetail[];
      okresCache.set(okresNuts, bundle);
    }
    const found = bundle.find((o) => o.kod === kod);
    return found ? { ...found, zdroj: "2022" } : null;
  } catch {
    return null;
  }
}

/* ── Průběžné výsledky KV 2026 (živé XML ČSÚ, volby.gov.cz) ─────────────── */

/**
 * ČSÚ během sčítání průběžně přepisuje statické XML soubory po okresech
 * (stejný formát jako opendata 2022 + atributy JE_SPOCTENO / OKRSKY_ZPRAC).
 * Soubory mají `Access-Control-Allow-Origin: *`, takže je stahujeme přímo
 * z prohlížeče – bez vlastního backendu. Zdroj: ČSÚ, CC BY 4.0.
 */
export const LIVE_DATUM_VOLEB = "20261009";
export const LIVE_XML_URL = (okresNuts: string) =>
  `https://volby.gov.cz/appdata/kv2026/${LIVE_DATUM_VOLEB}/odata/okresy/vysledky_obce_okres_${okresNuts}.xml`;

/** Jak dlouho držíme stažený okres v paměti, než ho znovu stáhneme (ms). */
const LIVE_TTL_MS = 60_000;

interface LiveBundle {
  fetchedAt: number;
  generovano: string;
  obce: Map<string, Omit<ObecDetail, keyof ObecIndexEntry> & { kod: string; nazev: string; mandatu: number }>;
}

const liveCache = new Map<string, LiveBundle>();

function num(el: Element | null, attr: string): number {
  if (!el) return 0;
  const v = el.getAttribute(attr);
  if (v == null || v === "") return 0;
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function parseLiveXml(text: string): LiveBundle {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("XML parse error");
  }
  const root = doc.documentElement;
  const generovano = root.getAttribute("DATUM_CAS_GENEROVANI") ?? "";
  const obce: LiveBundle["obce"] = new Map();

  const obecEls = Array.from(doc.getElementsByTagName("OBEC"));
  for (const o of obecEls) {
    const typ = o.getAttribute("OZNAC_TYPU");
    if (typ !== "OBEC" && typ !== "MCMO") continue;
    const kod = o.getAttribute("KODZASTUP") ?? "";
    const vysledek = o.getElementsByTagName("VYSLEDEK")[0];
    if (!kod || !vysledek) continue;
    const ucast = vysledek.getElementsByTagName("UCAST")[0] ?? null;
    const strany: ObecStrana[] = Array.from(vysledek.getElementsByTagName("VOLEBNI_STRANA")).map((s) => {
      const out: ObecStrana = {
        nazev: s.getAttribute("NAZEV_STRANY") ?? "",
        hlasy: num(s, "HLASY"),
        mandaty: num(s, "ZASTUPITELE_POCET"),
      };
      const k = s.getAttribute("KANDIDATU_POCET");
      if (k) out.kandidatu = num(s, "KANDIDATU_POCET");
      return out;
    });

    obce.set(kod, {
      kod,
      nazev: o.getAttribute("NAZEVZAST") ?? "",
      mandatu: num(o, "VOLENO_ZASTUP"),
      volicu: num(ucast, "ZAPSANI_VOLICI"),
      ucast: num(ucast, "UCAST_PROC"),
      platneHlasy: num(ucast, "PLATNE_HLASY"),
      strany,
      zdroj: "2026",
      live: {
        okrskyCelkem: num(ucast, "OKRSKY_CELKEM"),
        okrskyZprac: num(ucast, "OKRSKY_ZPRAC"),
        okrskyProc: num(ucast, "OKRSKY_ZPRAC_PROC"),
        spocteno: o.getAttribute("JE_SPOCTENO") === "1",
        generovano,
      },
    });
  }
  return { fetchedAt: Date.now(), generovano, obce };
}

export type LiveResult =
  | { ok: true; detail: ObecDetail }
  | { ok: false; reason: "unavailable" | "not-found" };

/**
 * Načte průběžný výsledek obce z živého XML ČSÚ. `force` obejde cache
 * (tlačítko „Obnovit"). Metadata obce (okres, kraj, obyvatelé) doplňujeme
 * z indexu; počet mandátů bereme z živých dat (VOLENO_ZASTUP 2026).
 */
export async function fetchObecDetailLive(entry: ObecIndexEntry, force = false): Promise<LiveResult> {
  try {
    let bundle = liveCache.get(entry.okresNuts);
    if (force || !bundle || Date.now() - bundle.fetchedAt > LIVE_TTL_MS) {
      const r = await fetch(LIVE_XML_URL(entry.okresNuts), { cache: "no-store" });
      if (!r.ok) return bundle ? withVoters(pick(bundle, entry), entry) : { ok: false, reason: "unavailable" };
      bundle = parseLiveXml(await r.text());
      liveCache.set(entry.okresNuts, bundle);
    }
    return withVoters(pick(bundle, entry), entry);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

/** Částečně sečtená obec: doplní celkový počet zapsaných voličů z dat 2022. */
async function withVoters(r: LiveResult, entry: ObecIndexEntry): Promise<LiveResult> {
  if (!r.ok || !r.detail.live) return r;
  const { live } = r.detail;
  if (live.spocteno || live.okrskyProc >= 100 || live.okrskyZprac >= live.okrskyCelkem) return r;
  const final2022 = await fetchObecDetail(entry.okresNuts, entry.kod);
  if (!final2022 || !final2022.volicu) return r;
  return {
    ok: true,
    detail: {
      ...r.detail,
      volicu: Math.max(final2022.volicu, r.detail.volicu),
      live: { ...live, volicuZ2022: true },
    },
  };
}

function pick(bundle: LiveBundle, entry: ObecIndexEntry): LiveResult {
  const o = bundle.obce.get(entry.kod);
  if (!o) return { ok: false, reason: "not-found" };
  const detail: ObecDetail = {
    ...entry,
    ...o,
    nazev: o.nazev || entry.nazev,
    mandatu: o.mandatu || entry.mandatu,
  };
  return { ok: true, detail };
}

/** Diakritika-insensitive normalizace pro vyhledávání. */
export function normalizeText(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}
