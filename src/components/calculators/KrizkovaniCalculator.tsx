import { useMemo, useState } from "react";
import { Plus, Trash2, ArrowUp, Check, CircleDot } from "lucide-react";
import { rankCandidatesWithinList } from "@/lib/dhondt";
import { site } from "@/content/site";
import { formatNumber, cn } from "@/lib/utils";
import { Field, NumberInput } from "@/components/ui";

let cc = 0;
const cid = () => `c${++cc}`;
interface CRow { id: string; votes: number; }

const DEFAULT: CRow[] = [
  { id: cid(), votes: 120 },
  { id: cid(), votes: 95 },
  { id: cid(), votes: 210 },
  { id: cid(), votes: 88 },
  { id: cid(), votes: 60 },
  { id: cid(), votes: 150 },
];

export function KrizkovaniCalculator() {
  const [seatsWon, setSeatsWon] = useState(3);
  const [rows, setRows] = useState<CRow[]>(DEFAULT);

  const { order, jumped, hranice, partyVotes } = useMemo(() => {
    const votes = rows.map((r) => r.votes);
    const pv = votes.reduce((a, b) => a + b, 0);
    const kp = votes.length || 1;
    const { order, jumped } = rankCandidatesWithinList(votes, pv, kp);
    return { order, jumped, hranice: Math.floor(pv / kp) * 1.1, partyVotes: pv };
  }, [rows]);

  return (
    <div className="space-y-8">
      {/* Vysvětlení */}
      <div className="grid gap-4 sm:grid-cols-3">
        {site.krizkovani.how.map((c, i) => (
          <div key={i} className="card p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand font-display font-bold text-white">
              {i + 1}
            </div>
            <h4 className="mt-3 font-display text-base font-bold">{c.h}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-gray-dark">{c.p}</p>
          </div>
        ))}
      </div>

      {/* Simulátor posunu */}
      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-bold">{site.krizkovani.sim.title}</h3>
        <p className="mt-1 text-sm text-brand-gray-dark">{site.krizkovani.sim.intro}</p>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <Field label={site.krizkovani.sim.seats} htmlFor="k-seats">
              <NumberInput value={seatsWon} onChange={setSeatsWon} min={0} max={rows.length} suffix="mandátů" />
            </Field>
            <div>
              <span className="field-label">{site.krizkovani.sim.candidateVotes}</span>
              <div className="space-y-2">
                {rows.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="w-7 shrink-0 text-center text-sm font-semibold text-brand-gray-dark">
                      {i + 1}.
                    </span>
                    <NumberInput
                      value={r.votes}
                      onChange={(v) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, votes: v } : x)))}
                      min={0}
                      className="flex-1"
                      suffix="hl."
                    />
                    <button
                      type="button"
                      onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                      className="btn-ghost shrink-0 px-2 py-2 hover:text-emap-red"
                      aria-label="Odebrat kandidáta"
                      disabled={rows.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRows((rs) => [...rs, { id: cid(), votes: 0 }])}
                className="btn-secondary mt-3 px-4 py-2 text-sm"
              >
                <Plus className="h-4 w-4" /> {site.krizkovani.sim.addCandidate}
              </button>
            </div>
          </div>

          {/* Výsledek pořadí */}
          <div>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="chip">
                {site.krizkovani.sim.threshold}: {formatNumber(hranice, 1)} hl.
              </span>
              <span className="text-brand-gray-dark">Σ {formatNumber(partyVotes)} hlasů</span>
            </div>
            <ol className="space-y-2">
              {order.map((listIndex, rank) => {
                const elected = rank < seatsWon;
                const didJump = jumped.has(listIndex);
                return (
                  <li
                    key={listIndex}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-2.5",
                      elected ? "border-brand-teal/40 bg-brand-teal/5" : "border-slate-200 bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        elected ? "gradient-brand text-white" : "bg-slate-100 text-brand-gray-dark",
                      )}
                    >
                      {rank + 1}
                    </span>
                    <span className="flex-1 text-sm">
                      <span className="font-semibold text-brand-blue">{listIndex + 1}. na listině</span>
                      <span className="ml-2 text-brand-gray-dark">{formatNumber(rows[listIndex]!.votes)} hl.</span>
                    </span>
                    {didJump && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        <ArrowUp className="h-3 w-3" /> {site.krizkovani.sim.jumped}
                      </span>
                    )}
                    {elected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal-dark">
                        <Check className="h-3.5 w-3.5" /> {site.krizkovani.sim.elected}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-gray-dark">
                        <CircleDot className="h-3.5 w-3.5" /> {site.krizkovani.sim.substitute}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
