/**
 * Kampaňová matematika: „kolik hlasů (a kolik lidí) potřebujete na 1 %
 * a na mandát" ve volbách do zastupitelstev obcí.
 *
 * Specifikum komunálních voleb: každý volič má tolik hlasů, kolik se volí
 * zastupitelů (S). Proto je nutné rozlišovat „hlasy" a „lidi" – jeden volič,
 * který zakroužkuje celou kandidátku, dá straně až S hlasů.
 *
 *   H (celkem platných hlasů pro strany) ≈ V × t × S × f
 *     V = zapsaní voliči, t = volební účast (0–1),
 *     S = počet mandátů, f = míra využití hlasů (0–1, kolik z S hlasů
 *         volič v průměru reálně použije; plná kandidátka → f ≈ 1).
 */

export interface QuorumParams {
  /** Počet voličů zapsaných v seznamu (V). */
  voters: number;
  /** Volební účast jako podíl 0–1 (t). */
  turnout: number;
  /** Počet volených zastupitelů (S). */
  seats: number;
  /** Míra využití hlasů 0–1 (f), default 1 (volič využije všechny hlasy). */
  fillRate?: number;
}

export interface QuorumStats {
  /** Počet hlasů na jednoho voliče (= S). */
  votesPerVoter: number;
  /** Počet voličů, kteří přijdou k volbám (V × t). */
  participatingVoters: number;
  /** Odhad celkového počtu platných hlasů pro strany (H). */
  totalPartyVotes: number;
  /** Kolik hlasů odpovídá 1 % (H / 100). */
  votesPerOnePercent: number;
  /** Kolik „plných" voličů odpovídá 1 % (hlasy/1 % ÷ S). */
  peoplePerOnePercent: number;
  /** Přibližně hlasů na 1 mandát (H / S). */
  votesPerSeat: number;
  /** Přibližně „plných" voličů na 1 mandát. */
  peoplePerSeat: number;
  /** Hlasy potřebné na 5% vstupní klauzuli u plné kandidátky (H / 20). */
  thresholdVotes: number;
  /** „Plní" voliči potřební na 5% klauzuli. */
  thresholdPeople: number;
}

export function quorumStats(params: QuorumParams): QuorumStats {
  const S = Math.max(1, params.seats);
  const f = params.fillRate ?? 1;
  const participating = Math.max(0, params.voters * params.turnout);
  const H = participating * S * f;

  const votesPerOnePercent = H / 100;
  const votesPerSeat = H / S;
  const thresholdVotes = H * 0.05;

  return {
    votesPerVoter: S,
    participatingVoters: participating,
    totalPartyVotes: H,
    votesPerOnePercent,
    peoplePerOnePercent: votesPerOnePercent / S,
    votesPerSeat,
    peoplePerSeat: votesPerSeat / S,
    thresholdVotes,
    thresholdPeople: thresholdVotes / S,
  };
}

/**
 * Zákonné rozpětí počtu členů zastupitelstva dle počtu obyvatel
 * (zákon č. 128/2000 Sb., o obcích, § 68).
 */
export function seatRangeForPopulation(population: number): [number, number] {
  if (population <= 500) return [5, 15];
  if (population <= 3000) return [7, 15];
  if (population <= 10000) return [11, 25];
  if (population <= 50000) return [15, 35];
  if (population <= 150000) return [25, 45];
  return [35, 55];
}
