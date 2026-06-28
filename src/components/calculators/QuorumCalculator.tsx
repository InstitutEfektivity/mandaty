import { useState } from "react";
import { Users, Vote } from "lucide-react";
import { quorumStats } from "@/lib/campaign";
import { site } from "@/content/site";
import { formatNumber } from "@/lib/utils";
import { Field, NumberInput, Slider, StatCard } from "@/components/ui";
import { ObecPicker } from "@/components/ObecPicker";
import type { ObecDetail } from "@/hooks/useObce";

export function QuorumCalculator() {
  const [voters, setVoters] = useState(5000);
  const [turnout, setTurnout] = useState(45);
  const [seats, setSeats] = useState(15);
  const [fillRate, setFillRate] = useState(90);
  const [obec, setObec] = useState<string | null>(null);

  const s = quorumStats({ voters, turnout: turnout / 100, seats, fillRate: fillRate / 100 });

  function applyObec(d: ObecDetail) {
    setObec(d.nazev);
    setVoters(d.volicu || voters);
    setSeats(d.mandatu || seats);
    if (d.ucast) setTurnout(Math.round(d.ucast));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      {/* Vstupy */}
      <div className="space-y-6">
        <ObecPicker selected={obec} onSelect={applyObec} onClear={() => setObec(null)} />

        <Field label={site.quorum.inputs.voters} htmlFor="q-voters">
          <NumberInput value={voters} onChange={setVoters} min={0} suffix="voličů" />
        </Field>

        <Field label={`${site.quorum.inputs.turnout}: ${turnout} %`}>
          <Slider value={turnout} onChange={setTurnout} min={5} max={100} />
        </Field>

        <Field label={site.quorum.inputs.seats} htmlFor="q-seats">
          <NumberInput value={seats} onChange={setSeats} min={5} max={70} suffix="mandátů" />
        </Field>

        <Field
          label={`${site.quorum.inputs.fillRate}: ${fillRate} %`}
          hint={site.quorum.inputs.fillRateHelp}
        >
          <Slider value={fillRate} onChange={setFillRate} min={30} max={100} step={5} />
        </Field>
      </div>

      {/* Výsledky */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            accent
            label={site.quorum.results.onePercent}
            value={`${formatNumber(s.votesPerOnePercent)}`}
            sub={
              <span className="inline-flex items-center gap-1">
                <Vote className="h-3.5 w-3.5" /> {site.quorum.results.votesUnit}
                <span className="mx-1 opacity-50">·</span>
                <Users className="h-3.5 w-3.5" /> ≈ {formatNumber(s.peoplePerOnePercent)} {site.quorum.results.peopleUnit}
              </span>
            }
          />
          <StatCard
            label={site.quorum.results.perSeat}
            value={formatNumber(s.votesPerSeat)}
            sub={`${site.quorum.results.votesUnit} · ≈ ${formatNumber(s.peoplePerSeat)} ${site.quorum.results.peopleUnit}`}
          />
          <StatCard
            label={site.quorum.results.threshold}
            value={formatNumber(s.thresholdVotes)}
            sub={`${site.quorum.results.votesUnit} · ≈ ${formatNumber(s.thresholdPeople)} ${site.quorum.results.peopleUnit}`}
          />
          <StatCard
            label={site.quorum.results.totalVotes}
            value={formatNumber(s.totalPartyVotes)}
            sub={`${formatNumber(s.participatingVoters)} voličů × ${seats} hlasů`}
          />
        </div>
        <p className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-brand-gray-dark">
          {site.quorum.results.peopleHint} {site.quorum.results.note}
        </p>
      </div>
    </div>
  );
}
