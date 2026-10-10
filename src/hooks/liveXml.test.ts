// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { fetchObecDetailLive, LIVE_XML_URL, type ObecIndexEntry } from "./useObce";

/**
 * Parsování živého XML ČSÚ (KV 2026, formát vysledky_obce_okres_CZXXXX.xml).
 * Ukázka je zkrácený reálný soubor z 10. 10. 2026 (Abertamy = spočteno,
 * Praha hl.m. = částečně sečteno).
 */
const SAMPLE = `<?xml version="1.0" encoding="utf-8"?>
<VYSLEDKY_OBCE_OKRES xmlns="http://www.volby.cz/kv/" DATUM_CAS_GENEROVANI="2026-10-10T19:33:02">
<OBEC KODZASTUP="554979" NAZEVZAST="Abertamy" OZNAC_TYPU="OBEC" VOLENO_ZASTUP="9" POCET_OBVODU="1" JE_SPOCTENO="1">
<VYSLEDEK>
<UCAST OKRSKY_CELKEM="1" OKRSKY_ZPRAC="1" OKRSKY_ZPRAC_PROC="100.00" ZAPSANI_VOLICI="697" VYDANE_OBALKY="352" UCAST_PROC="50.50" PLATNE_HLASY="2587"/>
<VOLEBNI_STRANA POR_STR_HLAS_LIST="1" VSTRANA="90" NAZEV_STRANY="ABERTAMSKÉ DĚDICTVÍ" HLASY="229" HLASY_PROC="8.85" KANDIDATU_POCET="3" ZASTUPITELE_POCET="0"></VOLEBNI_STRANA>
<VOLEBNI_STRANA POR_STR_HLAS_LIST="2" VSTRANA="1679" NAZEV_STRANY="Sdružení pro Abertamy" HLASY="1698" HLASY_PROC="65.64" KANDIDATU_POCET="9" ZASTUPITELE_POCET="7">
<ZASTUPITEL PORADOVE_CISLO="2" JMENO="Stanislav" PRIJMENI="Kabeš" HLASY="229" HLASY_PROC="13.48"/>
</VOLEBNI_STRANA>
<VOLEBNI_STRANA POR_STR_HLAS_LIST="3" VSTRANA="1118" NAZEV_STRANY="VOK – Volba pro kraj" HLASY="660" HLASY_PROC="25.51" KANDIDATU_POCET="9" ZASTUPITELE_POCET="2"></VOLEBNI_STRANA>
</VYSLEDEK>
</OBEC>
<OBEC KODZASTUP="554782" NAZEVZAST="Praha hl.m." OZNAC_TYPU="OBEC" VOLENO_ZASTUP="65" POCET_OBVODU="1" JE_SPOCTENO="0">
<VYSLEDEK>
<UCAST OKRSKY_CELKEM="1120" OKRSKY_ZPRAC="224" OKRSKY_ZPRAC_PROC="20.00" ZAPSANI_VOLICI="151803" UCAST_PROC="40.01" PLATNE_HLASY="3529760"/>
<VOLEBNI_STRANA VSTRANA="121" NAZEV_STRANY="LEPŠÍ ŽIVOT PRO LIDI" HLASY="2396" KANDIDATU_POCET="10" ZASTUPITELE_POCET="0"/>
</VYSLEDEK>
</OBEC>
<OBEC KODZASTUP="999999" NAZEVZAST="Bez výsledku" OZNAC_TYPU="OBEC" VOLENO_ZASTUP="7" JE_SPOCTENO="0"></OBEC>
</VYSLEDKY_OBCE_OKRES>`;

const entry = (kod: string, nazev: string): ObecIndexEntry => ({
  kod,
  nazev,
  okres: "Karlovy Vary",
  kraj: "Karlovarský kraj",
  obyvatel: 866,
  mandatu: 9,
  okresNuts: "CZ0412",
  typ: "OBEC",
});

function mockFetch(body: string | null, status = 200) {
  const calls: string[] = [];
  globalThis.fetch = (async (url: string) => {
    // Statické balíčky 2022 (doplnění voličů u částečně sečtené obce) → prázdné.
    if (!String(url).includes("volby.gov.cz")) {
      return { ok: true, status: 200, json: async () => [], text: async () => "[]" } as Response;
    }
    calls.push(String(url));
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => body ?? "",
    } as Response;
  }) as typeof fetch;
  return calls;
}

describe("fetchObecDetailLive – živé XML ČSÚ KV 2026", () => {
  it("sestaví URL okresu dle NUTS", () => {
    expect(LIVE_XML_URL("CZ0412")).toBe(
      "https://volby.gov.cz/appdata/kv2026/20261009/odata/okresy/vysledky_obce_okres_CZ0412.xml",
    );
  });

  it("naparsuje spočtenou obec vč. stran a stavu sčítání", async () => {
    const calls = mockFetch(SAMPLE);
    const r = await fetchObecDetailLive(entry("554979", "Abertamy"), true);
    expect(calls).toHaveLength(1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const d = r.detail;
    expect(d.zdroj).toBe("2026");
    expect(d.mandatu).toBe(9);
    expect(d.volicu).toBe(697);
    expect(d.ucast).toBe(50.5);
    expect(d.platneHlasy).toBe(2587);
    expect(d.strany).toEqual([
      { nazev: "ABERTAMSKÉ DĚDICTVÍ", hlasy: 229, mandaty: 0, kandidatu: 3 },
      { nazev: "Sdružení pro Abertamy", hlasy: 1698, mandaty: 7, kandidatu: 9 },
      { nazev: "VOK – Volba pro kraj", hlasy: 660, mandaty: 2, kandidatu: 9 },
    ]);
    expect(d.live).toEqual({
      okrskyCelkem: 1,
      okrskyZprac: 1,
      okrskyProc: 100,
      spocteno: true,
      generovano: "2026-10-10T19:33:02",
    });
    // metadata z indexu zůstávají
    expect(d.okres).toBe("Karlovy Vary");
    expect(d.obyvatel).toBe(866);
  });

  it("částečně sečtená obec má spocteno=false a % okrsků", async () => {
    mockFetch(SAMPLE);
    const r = await fetchObecDetailLive({ ...entry("554782", "Praha hl.m."), mandatu: 65 }, true);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.detail.live?.spocteno).toBe(false);
    expect(r.detail.live?.okrskyProc).toBe(20);
    expect(r.detail.live?.okrskyZprac).toBe(224);
    expect(r.detail.mandatu).toBe(65);
  });

  it("obec bez <VYSLEDEK> nebo mimo soubor → not-found", async () => {
    mockFetch(SAMPLE);
    const a = await fetchObecDetailLive(entry("999999", "Bez výsledku"), true);
    expect(a).toEqual({ ok: false, reason: "not-found" });
    const b = await fetchObecDetailLive(entry("123456", "Neexistuje"), true);
    expect(b).toEqual({ ok: false, reason: "not-found" });
  });

  it("HTTP chyba bez cache → unavailable", async () => {
    mockFetch(null, 503);
    const r = await fetchObecDetailLive({ ...entry("554979", "Abertamy"), okresNuts: "CZ0999" }, true);
    expect(r).toEqual({ ok: false, reason: "unavailable" });
  });

  it("druhé volání ve stejném okrese jde z cache (bez force)", async () => {
    const calls = mockFetch(SAMPLE);
    await fetchObecDetailLive({ ...entry("554979", "Abertamy"), okresNuts: "CZ0411" }, true);
    await fetchObecDetailLive({ ...entry("554782", "Praha hl.m."), okresNuts: "CZ0411" });
    expect(calls).toHaveLength(1);
  });
});

import { obecSlug, resolveObecParam, slugify } from "./useObce";

describe("URL slug obce", () => {
  const idx: ObecIndexEntry[] = [
    { ...entry("547174", "Praha 17"), okres: "Praha", typ: "MC" },
    { ...entry("529303", "Benešov"), okres: "Benešov" },
    { ...entry("581330", "Benešov"), okres: "Blansko" },
    { ...entry("535826", "Adamov"), okres: "České Budějovice" },
    { ...entry("581291", "Adamov"), okres: "Blansko" },
  ];

  it("slugify odstraní diakritiku a mezery", () => {
    expect(slugify("Praha 17")).toBe("praha-17");
    expect(slugify("České Budějovice")).toBe("ceske-budejovice");
  });

  it("unikátní název → jen název; shodné názvy → s okresem", () => {
    expect(obecSlug(idx[0]!, idx)).toBe("praha-17");
    expect(obecSlug(idx[1]!, idx)).toBe("benesov-benesov");
    expect(obecSlug(idx[2]!, idx)).toBe("benesov-blansko");
    expect(obecSlug(idx[4]!, idx)).toBe("adamov-blansko");
  });

  it("resolve: slug, název-okres, číselný kód, nejednoznačný název", () => {
    expect(resolveObecParam("praha-17", idx)?.kod).toBe("547174");
    expect(resolveObecParam("Praha 17", idx)?.kod).toBe("547174");
    expect(resolveObecParam("benesov-blansko", idx)?.kod).toBe("581330");
    expect(resolveObecParam("581291", idx)?.kod).toBe("581291");
    expect(resolveObecParam("benesov", idx)).toBeUndefined();
    expect(resolveObecParam("neexistuje", idx)).toBeUndefined();
  });
});
