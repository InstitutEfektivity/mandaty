import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { allocateSeats, type PartyInput } from "./dhondt";

/**
 * Ověření proti REÁLNÝM oficiálním výsledkům KV 2022 (ČSÚ):
 * spočítané rozdělení mandátů musí přesně odpovídat počtu mandátů,
 * který ČSÚ přidělil každé kandidátce. Validuje práh i D'Hondt na ostrých datech.
 */
function loadObec(nuts: string, kod: string) {
  const p = path.join(process.cwd(), "public", "data", "okres", `${nuts}.json`);
  const arr = JSON.parse(fs.readFileSync(p, "utf8")) as any[];
  return arr.find((o) => o.kod === kod);
}

const CASES = [
  { nuts: "CZ0100", kod: "554782", name: "Praha hl.m." },
  { nuts: "CZ0642", kod: "582786", name: "Brno" },
  { nuts: "CZ0201", kod: "529303", name: "Benešov" },
];

describe("allocateSeats vs oficiální mandáty ČSÚ (KV 2022)", () => {
  for (const c of CASES) {
    it(`${c.name} – rozdělení mandátů odpovídá ČSÚ`, () => {
      const obec = loadObec(c.nuts, c.kod);
      expect(obec, `data pro ${c.name}`).toBeTruthy();
      const parties: PartyInput[] = obec.strany
        .filter((s: any) => s.hlasy > 0)
        .map((s: any, i: number) => ({
          id: String(i),
          name: s.nazev,
          votes: s.hlasy,
          candidates: s.kandidatu,
        }));
      const r = allocateSeats(parties, obec.mandatu);
      const computed = new Map(r.parties.map((p) => [p.name, p.seats]));
      for (const s of obec.strany) {
        expect(computed.get(s.nazev), `${c.name}: ${s.nazev}`).toBe(s.mandaty);
      }
      // součet mandátů sedí
      const sum = r.parties.reduce((a, p) => a + p.seats, 0);
      expect(sum).toBe(obec.mandatu);
    });
  }
});
