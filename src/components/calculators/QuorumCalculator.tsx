import { useState } from "react";
import { quorumStats } from "@/lib/campaign";
import { site } from "@/content/site";
import { formatNumber } from "@/lib/utils";
import { Field, NumberInput, Slider, StatCard } from "@/components/ui";
import { ObecPicker } from "@/components/ObecPicker";
import type { ObecDetail } from "@/hooks/useObce";

function peopleValue(n: number, unit: string = site.quorum.results.peopleUnit) {
  return (
    <span>
      {formatNumber(n)}
      <span className="ml-1 text-base font-semibold opacity-70">{unit}</span>
    </span>
  );
}

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

      {/* Výsledky – hlavní číslo = lidé, menší = hlasy */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            accent
            label={site.quorum.results.onePercent}
            value={peopleValue(s.peoplePerOnePercent)}
            sub={`≈ ${formatNumber(s.votesPerOnePercent)} ${site.quorum.results.votesUnit}`}
          />
          <StatCard
            label={site.quorum.results.perSeat}
            value={peopleValue(s.peoplePerSeat)}
            sub={`≈ ${formatNumber(s.votesPerSeat)} ${site.quorum.results.votesUnit}`}
          />
          <StatCard
            label={site.quorum.results.threshold}
            value={peopleValue(s.thresholdPeople)}
            sub={`≈ ${formatNumber(s.thresholdVotes)} ${site.quorum.results.votesUnit}`}
          />
          <StatCard
            label={site.quorum.results.turnout}
            value={peopleValue(s.participatingVoters, site.quorum.results.voterUnit)}
            sub={`${formatNumber(s.totalPartyVotes)} platných ${site.quorum.results.votesUnit}`}
          />
        </div>
        <p className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-brand-gray-dark">
          {site.quorum.results.note}
        </p>
      </div>
    </div>
  );
}
