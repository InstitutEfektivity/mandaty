/**
 * Rozdělení mandátů ve volbách do zastupitelstev obcí
 * dle zákona č. 491/2001 Sb., § 34 (hlasování) a § 45 (výsledky voleb).
 *
 * Metodika ověřena proti primárnímu zdroji:
 *   ČSÚ – „Podrobný popis postupu při rozdělování mandátů ve volbách
 *   do zastupitelstev obcí" (volby.cz, 15. 6. 2022).
 *
 * Klíčová pravidla:
 *  1) Přepočtený základ listiny = (H / S) × min(kp, S)
 *     H = celkový počet platných hlasů v obci, S = počet volených zastupitelů,
 *     kp = počet (platných) kandidátů listiny.
 *  2) Vstupní klauzule (skrutinium): podíl = hlasy / základ × 100 ≥ 5 %.
 *     Pokud do skrutinia nepostoupí alespoň 2 listiny, klauzule se snižuje
 *     po 1 % a postup se opakuje (bod 6 metodiky).
 *  3) D'Hondt: hlasy listiny / 1, 2, 3, …, kp; všechny podíly se seřadí
 *     sestupně, prvních S získává mandát. Rovnost podílů: vyšší celkový
 *     počet hlasů listiny; je-li i ten shodný → los.
 *  4) Mandát uvnitř listiny: hranice = (celá část z hlasy/kp) × 1,1.
 *     Kandidát, jehož počet hlasů hranice DOSÁHNE (≥), se posune na začátek
 *     (sestupně dle hlasů; při rovnosti dle pořadí na listině). Zbývající
 *     mandáty se přidělí v pořadí na hlasovacím lístku.
 *
 * Veškerá kritická porovnání (rovnost podílů, hranice posunu) se počítají
 * celočíselně (cross-multiply), aby nedošlo k chybám zaokrouhlení.
 */

export interface PartyInput {
  id: string;
  name: string;
  /** Celkový počet platných hlasů pro listinu (součet hlasů kandidátů). */
  votes: number;
  /**
   * Počet (platných) kandidátů na listině (kp). Pokud není zadán, předpokládá
   * se plná listina (kp = počet mandátů S), tj. listina může získat až S mandátů.
   */
  candidates?: number;
  /**
   * Volitelně hlasy jednotlivých kandidátů v pořadí na hlasovacím lístku.
   * Pokud jsou zadány, přepíšou `votes` (součtem) i `candidates` (délkou)
   * a umožní přiřadit mandáty konkrétním kandidátům (posuny / náhradníci).
   */
  candidateVotes?: number[];
}

export interface CandidateResult {
  /** Index kandidáta v původním pořadí na listině (0-based). */
  listIndex: number;
  votes: number;
  elected: boolean;
  /** Pořadí přidělení (0-based) po aplikaci posunů – 0 = první v pořadí. */
  rank: number;
  /** true = kandidát se posunul díky preferenčním hlasům (dosáhl hranice). */
  jumped: boolean;
}

export interface PartyResult {
  id: string;
  name: string;
  votes: number;
  candidates: number;
  advanced: boolean;
  /** Přepočtený základ pro test klauzule. */
  zaklad: number;
  /** Podíl hlasů na přepočteném základu × 100 (pro zobrazení). */
  pomerProcenta: number;
  seats: number;
  /** Pořadí kandidátů (vč. posunů) – jen pokud byly zadány candidateVotes. */
  candidateResults?: CandidateResult[];
}

export interface Quotient {
  partyId: string;
  partyName: string;
  divisor: number;
  value: number;
}

export interface AllocationResult {
  /** Počet volených zastupitelů (S). */
  seats: number;
  /** Celkový počet platných hlasů v obci (H). */
  totalValidVotes: number;
  /** Skutečně použitá vstupní klauzule v % (po případném snížení). */
  thresholdPercent: number;
  parties: PartyResult[];
  /** Vítězné podíly (top S) – D'Hondtova tabulka pro audit/zobrazení. */
  winningQuotients: Quotient[];
  /** Skutečně rozdělený počet mandátů (může být < S v krajních případech). */
  seatsAllocated: number;
  /** true, pokud o pořadí některého podílu musel rozhodnout los. */
  tieResolvedByLot: boolean;
  notes: string[];
}

const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

interface NormalizedParty {
  id: string;
  name: string;
  votes: number;
  kp: number;
  candidateVotes?: number[];
}

function normalize(parties: PartyInput[], seats: number): NormalizedParty[] {
  return parties.map((p) => {
    if (p.candidateVotes && p.candidateVotes.length > 0) {
      return {
        id: p.id,
        name: p.name,
        votes: sum(p.candidateVotes),
        kp: p.candidateVotes.length,
        candidateVotes: p.candidateVotes,
      };
    }
    return {
      id: p.id,
      name: p.name,
      votes: Math.max(0, Math.round(p.votes)),
      // Není-li počet kandidátů zadán, předpokládáme plnou listinu (kp = S).
      kp: Math.max(1, p.candidates ?? seats),
    };
  });
}

/**
 * Pořadí kandidátů uvnitř listiny po aplikaci preferenčního posunu (bod 13/14).
 * Vrací indexy do původního pořadí na listině, seřazené dle pravidel přidělování.
 */
export function rankCandidatesWithinList(
  candidateVotes: number[],
  partyVotes: number,
  kp: number,
): { order: number[]; jumped: Set<number> } {
  const jumped = new Set<number>();
  if (candidateVotes.length <= 1) {
    return { order: candidateVotes.map((_, i) => i), jumped };
  }

  // hranice = (celá část z průměru) × 1,1. Porovnání celočíselně:
  // votes_c ≥ floor(partyVotes/kp) × 1,1  ⇔  votes_c × 10 ≥ floor(partyVotes/kp) × 11
  const avgFloor = Math.floor(partyVotes / kp);
  const isJumper = (votes: number) => votes * 10 >= avgFloor * 11;

  const indices = candidateVotes.map((_, i) => i);
  const jumpers = indices.filter((i) => isJumper(candidateVotes[i]!));
  const rest = indices.filter((i) => !isJumper(candidateVotes[i]!));

  // Posunutí: sestupně dle hlasů; při rovnosti dle pořadí na listině (nižší index).
  jumpers.sort((a, b) => {
    const dv = candidateVotes[b]! - candidateVotes[a]!;
    return dv !== 0 ? dv : a - b;
  });
  jumpers.forEach((i) => jumped.add(i));

  // Zbytek dle původního pořadí na listině (rest je už vzestupně dle indexu).
  return { order: [...jumpers, ...rest], jumped };
}

/**
 * Hlavní funkce: rozdělí `seats` mandátů mezi kandidátní listiny.
 */
export function allocateSeats(
  partiesInput: PartyInput[],
  seats: number,
): AllocationResult {
  const notes: string[] = [];
  const S = Math.max(1, Math.round(seats));
  const parties = normalize(partiesInput, S);
  const H = sum(parties.map((p) => p.votes));

  const result: AllocationResult = {
    seats: S,
    totalValidVotes: H,
    thresholdPercent: 5,
    parties: [],
    winningQuotients: [],
    seatsAllocated: 0,
    tieResolvedByLot: false,
    notes,
  };

  if (H === 0) {
    notes.push("Nebyly zadány žádné hlasy.");
    result.parties = parties.map((p) => buildPartyResult(p, false, 0, 0, 0, S));
    return result;
  }

  // ── Vstupní klauzule (skrutinium) ────────────────────────────────────────
  // Přepočtený základ je per-listina; klauzule se snižuje, dokud nepostoupí
  // alespoň 2 listiny (nebo dokud je co snižovat). U jediné listiny se
  // klauzule neuplatní (bod 9 metodiky).
  const zaklad = (p: NormalizedParty) => (H / S) * Math.min(p.kp, S);

  let clause = 5;
  let advancedSet: Set<string> = new Set();
  if (parties.length <= 1) {
    advancedSet = new Set(parties.map((p) => p.id));
  } else {
    while (clause >= 1) {
      advancedSet = new Set(
        parties
          .filter((p) => {
            // hlasy / základ × 100 ≥ clause  ⇔  hlasy × 100 × S ≥ clause × H × min(kp,S)
            const lhs = p.votes * 100 * S;
            const rhs = clause * H * Math.min(p.kp, S);
            return lhs >= rhs;
          })
          .map((p) => p.id),
      );
      if (advancedSet.size >= 2) break;
      clause -= 1;
    }
    if (clause < 5) {
      notes.push(
        `Vstupní klauzule snížena na ${clause} % – při 5 % by do skrutinia nepostoupily alespoň dvě listiny.`,
      );
    }
  }
  result.thresholdPercent = clause;

  // ── D'Hondtovy podíly ────────────────────────────────────────────────────
  const advancedParties = parties.filter((p) => advancedSet.has(p.id));
  const allQuotients: Quotient[] = [];
  for (const p of advancedParties) {
    const maxDiv = Math.min(p.kp, S); // víc než S mandátů ani víc než kp se nerozdá
    for (let d = 1; d <= maxDiv; d++) {
      allQuotients.push({
        partyId: p.id,
        partyName: p.name,
        divisor: d,
        value: p.votes / d,
      });
    }
  }

  const partyVotesById = new Map(parties.map((p) => [p.id, p.votes]));

  // Řazení podílů sestupně, celočíselně (cross-multiply), rovnost → vyšší
  // celkový počet hlasů listiny, dále los (deterministicky dle id + flag).
  allQuotients.sort((a, b) => {
    // a.value vs b.value  ⇔  va/da vs vb/db  ⇔  va*db vs vb*da
    const va = partyVotesById.get(a.partyId)!;
    const vb = partyVotesById.get(b.partyId)!;
    const cross = vb * a.divisor - va * b.divisor; // >0 → b větší
    if (cross !== 0) return cross > 0 ? 1 : -1;
    // rovnost podílu → vyšší celkový počet hlasů listiny napřed
    if (va !== vb) return vb - va;
    // úplná rovnost → los (deterministicky dle id)
    result.tieResolvedByLot = true;
    return a.partyId < b.partyId ? -1 : a.partyId > b.partyId ? 1 : 0;
  });

  const winning = allQuotients.slice(0, S);
  result.winningQuotients = winning;
  if (result.tieResolvedByLot) {
    notes.push(
      "O pořadí některého z podílů by podle zákona rozhodl los (shodný podíl i celkový počet hlasů). Kalkulačka zvolila deterministické pořadí.",
    );
  }

  const seatsByParty = new Map<string, number>();
  for (const q of winning) {
    seatsByParty.set(q.partyId, (seatsByParty.get(q.partyId) ?? 0) + 1);
  }
  result.seatsAllocated = winning.length;
  if (winning.length < S) {
    notes.push(
      `Rozděleno pouze ${winning.length} z ${S} mandátů – postupující listiny nemají dostatek kandidátů. (Krajní případ dle bodů 7–8 metodiky řeš individuálně.)`,
    );
  }

  // ── Sestavení výsledků listin ────────────────────────────────────────────
  result.parties = parties.map((p) => {
    const advanced = advancedSet.has(p.id);
    const partySeats = seatsByParty.get(p.id) ?? 0;
    const pr = buildPartyResult(
      p,
      advanced,
      zaklad(p),
      (p.votes / zaklad(p)) * 100,
      partySeats,
      S,
    );

    if (p.candidateVotes && partySeats >= 0) {
      const { order, jumped } = rankCandidatesWithinList(
        p.candidateVotes,
        p.votes,
        p.kp,
      );
      pr.candidateResults = order.map((listIndex, rank) => ({
        listIndex,
        votes: p.candidateVotes![listIndex]!,
        elected: rank < partySeats,
        rank,
        jumped: jumped.has(listIndex),
      }));
    }
    return pr;
  });

  return result;
}

function buildPartyResult(
  p: NormalizedParty,
  advanced: boolean,
  zaklad: number,
  pomerProcenta: number,
  seats: number,
  _S: number,
): PartyResult {
  return {
    id: p.id,
    name: p.name,
    votes: p.votes,
    candidates: p.kp,
    advanced,
    zaklad,
    pomerProcenta: Number.isFinite(pomerProcenta) ? pomerProcenta : 0,
    seats,
  };
}

/**
 * Plná D'Hondtova tabulka (pro zobrazení): pro každou postupující listinu
 * podíly 1..min(kp,S) s informací, zda podíl získal mandát.
 */
export function dhondtTable(result: AllocationResult): {
  divisors: number[];
  rows: { partyId: string; partyName: string; values: (number | null)[] }[];
} {
  const maxDivisor = result.seats;
  const divisors = Array.from({ length: maxDivisor }, (_, i) => i + 1);
  const winningSet = new Set(
    result.winningQuotients.map((q) => `${q.partyId}#${q.divisor}`),
  );
  const rows = result.parties
    .filter((p) => p.advanced)
    .map((p) => ({
      partyId: p.id,
      partyName: p.name,
      values: divisors.map((d) =>
        d <= Math.min(p.candidates, result.seats) ? p.votes / d : null,
      ),
      winning: divisors.map((d) => winningSet.has(`${p.id}#${d}`)),
    }));
  return { divisors, rows };
}
