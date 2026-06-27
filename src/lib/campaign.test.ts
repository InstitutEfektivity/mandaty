import { describe, it, expect } from "vitest";
import { quorumStats, seatRangeForPopulation } from "./campaign";

describe("quorumStats", () => {
  const s = quorumStats({ voters: 8000, turnout: 0.45, seats: 15, fillRate: 0.9 });

  it("odhadne celkový počet hlasů H = V×t×S×f", () => {
    expect(s.participatingVoters).toBeCloseTo(3600, 0);
    expect(s.totalPartyVotes).toBeCloseTo(48600, 0);
  });

  it("hlasy na 1 % = H/100, hlasy na mandát = H/S", () => {
    expect(s.votesPerOnePercent).toBeCloseTo(486, 0);
    expect(s.votesPerSeat).toBeCloseTo(3240, 0);
  });

  it("lidé na mandát = hlasy na mandát ÷ S", () => {
    expect(s.peoplePerSeat).toBeCloseTo(216, 0);
  });

  it("hlasy na 5% klauzuli = H/20", () => {
    expect(s.thresholdVotes).toBeCloseTo(2430, 0);
  });
});

describe("seatRangeForPopulation – § 68 zákona o obcích", () => {
  it("vrací správná rozpětí dle počtu obyvatel", () => {
    expect(seatRangeForPopulation(300)).toEqual([5, 15]);
    expect(seatRangeForPopulation(2000)).toEqual([7, 15]);
    expect(seatRangeForPopulation(8000)).toEqual([11, 25]);
    expect(seatRangeForPopulation(40000)).toEqual([15, 35]);
    expect(seatRangeForPopulation(100000)).toEqual([25, 45]);
    expect(seatRangeForPopulation(1300000)).toEqual([35, 55]);
  });
});
