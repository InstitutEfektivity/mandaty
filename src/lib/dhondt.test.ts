import { describe, it, expect } from "vitest";
import { allocateSeats, rankCandidatesWithinList, type PartyInput } from "./dhondt";

/**
 * Zlatý fixture = ČSÚ Sborník příkladů, příklad č. 9 (S = 7).
 * Ručně ověřeno proti metodice ČSÚ (15. 6. 2022).
 * Výsledek: A = 3, B = 3, C = 1, D = 0; uvnitř A zvoleni #3, #6, #5.
 */
const example9: PartyInput[] = [
  { id: "A", name: "Strana A", candidateVotes: [85, 67, 92, 65, 88, 90, 83, 88, 68] }, // 726
  { id: "B", name: "Strana B", candidateVotes: [77, 88, 105, 110, 113, 112, 109, 110] }, // 824
  { id: "C", name: "Strana C", candidateVotes: [65, 68, 68, 66, 66, 70, 65] }, // 468
  { id: "D", name: "Strana D", candidateVotes: [85] }, // 85
];

describe("allocateSeats – ČSÚ příklad 9", () => {
  const r = allocateSeats(example9, 7);

  it("celkový počet platných hlasů H = 2103", () => {
    expect(r.totalValidVotes).toBe(2103);
  });

  it("všechny čtyři listiny postoupí do skrutinia (klauzule 5 %)", () => {
    expect(r.thresholdPercent).toBe(5);
    expect(r.parties.every((p) => p.advanced)).toBe(true);
  });

  it("listina s 1 kandidátem (D) projde díky přepočteném základu", () => {
    const d = r.parties.find((p) => p.id === "D")!;
    expect(d.advanced).toBe(true);
    expect(d.pomerProcenta).toBeCloseTo(28.29, 1);
  });

  it("rozdělení mandátů A=3, B=3, C=1, D=0", () => {
    const seats = Object.fromEntries(r.parties.map((p) => [p.id, p.seats]));
    expect(seats).toEqual({ A: 3, B: 3, C: 1, D: 0 });
    expect(r.seatsAllocated).toBe(7);
  });

  it("uvnitř A zvoleni kandidáti #3, #6, #5 (0-based 2, 5, 4)", () => {
    const a = r.parties.find((p) => p.id === "A")!;
    const elected = a.candidateResults!.filter((c) => c.elected).map((c) => c.listIndex);
    expect(new Set(elected)).toEqual(new Set([2, 5, 4]));
  });

  it("uvnitř A: #5 (88 hlasů) se posunul, #1 (85) nikoli", () => {
    const a = r.parties.find((p) => p.id === "A")!;
    const c5 = a.candidateResults!.find((c) => c.listIndex === 4)!; // #5
    const c1 = a.candidateResults!.find((c) => c.listIndex === 0)!; // #1
    expect(c5.jumped).toBe(true);
    expect(c1.jumped).toBe(false);
  });

  it("uvnitř B nikdo nedosáhne hranice → mandáty dle pořadí #1, #2, #3", () => {
    const b = r.parties.find((p) => p.id === "B")!;
    const elected = b.candidateResults!.filter((c) => c.elected).map((c) => c.listIndex);
    expect(elected).toEqual([0, 1, 2]);
    expect(b.candidateResults!.every((c) => !c.jumped)).toBe(true);
  });
});

describe("rankCandidatesWithinList – pravidlo hranice", () => {
  it("hranice = floor(prům.) × 1,1, porovnání ≥ (dosáhne)", () => {
    // A: 726 hlasů, 9 kandidátů → floor(80.66)=80 → hranice 88,0
    const { jumped } = rankCandidatesWithinList(
      [85, 67, 92, 65, 88, 90, 83, 88, 68],
      726,
      9,
    );
    // ≥ 88 dosáhnou: #3(92), #5(88), #6(90), #8(88) → indexy 2,4,5,7
    expect(jumped).toEqual(new Set([2, 4, 5, 7]));
  });

  it("při rovnosti hlasů u posunutých rozhoduje pořadí na listině", () => {
    const { order } = rankCandidatesWithinList(
      [85, 67, 92, 65, 88, 90, 83, 88, 68],
      726,
      9,
    );
    // posunutí sestupně dle hlasů: 92(#3),90(#6),88(#5),88(#8) → 2,5,4,7
    expect(order.slice(0, 4)).toEqual([2, 5, 4, 7]);
  });
});

describe("vstupní klauzule – snížení o 1 % (bod 6 metodiky)", () => {
  it("pokud při 5 % postoupí < 2 listiny, klauzule se sníží", () => {
    // Jedna dominantní listina + dvě slabé pod 5 %.
    const parties: PartyInput[] = [
      { id: "X", name: "X", votes: 9000, candidates: 11 },
      { id: "Y", name: "Y", votes: 300, candidates: 11 },
      { id: "Z", name: "Z", votes: 250, candidates: 11 },
    ];
    const r = allocateSeats(parties, 11);
    // H=9550, základ(plná listina)=H. 5% z 9550=477,5 → jen X projde → sníží se.
    expect(r.thresholdPercent).toBeLessThan(5);
    const advanced = r.parties.filter((p) => p.advanced).length;
    expect(advanced).toBeGreaterThanOrEqual(2);
  });
});

describe("allocateSeats – jen party-level vstup (bez kandidátů)", () => {
  it("plná listina: votes vstup, D'Hondt rozdělí mandáty", () => {
    const parties: PartyInput[] = [
      { id: "A", name: "A", votes: 1000 },
      { id: "B", name: "B", votes: 500 },
      { id: "C", name: "C", votes: 300 },
    ];
    const r = allocateSeats(parties, 5);
    // D'Hondt: 1000,500,333.3,333,300,250,250... top5: 1000(A),500(A/B?),...
    // 1000,500,333.3(A),300(C),250(A) → A=3? Spočti: kvocienty:
    // A:1000,500,333.33,250,200 B:500,250,166.6 C:300,150,100
    // top5 desc: 1000(A),500(A),500(B),333.33(A),300(C) → A=3,B=1,C=1
    const seats = Object.fromEntries(r.parties.map((p) => [p.id, p.seats]));
    expect(seats).toEqual({ A: 3, B: 1, C: 1 });
  });
});
