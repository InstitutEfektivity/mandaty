import { useMemo, useState } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { allocateSeats, dhondtTable, type PartyInput } from "@/lib/dhondt";
import { site } from "@/content/site";
import { formatNumber } from "@/lib/utils";
import { Field, NumberInput, TextInput } from "@/components/ui";
import { ObecPicker } from "@/components/ObecPicker";
import { SeatChart, PARTY_COLORS, type SeatDatum } from "@/components/SeatChart";
import type { ObecDetail } from "@/hooks/useObce";

interface Row {
  id: string;
  name: string;
  votes: number;
  candidates?: number;
}

let counter = 0;
const newId = () => `p${++counter}`;

const DEFAULT_ROWS: Row[] = [
  { id: newId(), name: "Listina A", votes: 1200 },
  { id: newId(), name: "Listina B", votes: 980 },
  { id: newId(), name: "Listina C", votes: 540 },
  { id: newId(), name: "Listina D", votes: 410 },
  { id: newId(), name: "Listina E", votes: 180 },
];

export function MandateCalculator() {
  const [seats, setSeats] = useState(15);
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [obec, setObec] = useState<string | null>(null);

  const result = useMemo(() => {
    const parties: PartyInput[] = rows
      .filter((r) => r.votes > 0)
      .map((r) => ({
        id: r.id,
        name: r.name.trim() || "Bez názvu",
        votes: r.votes,
        candidates: r.candidates,
      }));
    if (parties.length < 1) return null;
    return allocateSeats(parties, seats);
  }, [rows, seats]);

  const colorFor = (id: string) => {
    const idx = rows.findIndex((r) => r.id === id);
    return PARTY_COLORS[idx % PARTY_COLORS.length]!;
  };

  function applyObec(d: ObecDetail) {
    setObec(d.nazev);
    if (d.mandatu) setSeats(d.mandatu);
    // Předvyplníme VŠECHNY kandidátky seřazené dle počtu hlasů (sestupně),
    // ať výpočet odpovídá realitě (jinak by se vynechaly velké strany).
    const sorted = d.strany.filter((s) => s.hlasy > 0).slice().sort((a, b) => b.hlasy - a.hlasy);
    if (sorted.length > 0) {
      counter = 0;
      setRows(
        sorted.map((s) => ({ id: newId(), name: s.nazev, votes: s.hlasy, candidates: s.kandidatu })),
      );
    }
  }

  const seatData: SeatDatum[] =
    result?.parties.map((p) => ({
      id: p.id,
      name: p.name,
      seats: p.seats,
      votes: p.votes,
      color: p.advanced ? colorFor(p.id) : "#cbd5e1",
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* Ovládání: výběr obce + počet mandátů */}
      <div className="flex flex-wrap items-end gap-4">
        <ObecPicker selected={obec} onSelect={applyObec} onClear={() => setObec(null)} />
        <div className="w-44">
          <Field label={site.mandates.seats} htmlFor="m-seats">
            <NumberInput value={seats} onChange={setSeats} min={5} max={70} suffix="mand." />
          </Field>
        </div>
      </div>

      {/* Editor kandidátek – na celou šířku, aby byl vidět název i hlasy */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-brand-blue">{site.mandates.partyName}</span>
          <span className="pr-12 text-sm font-semibold text-brand-blue">{site.mandates.partyVotes}</span>
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2">
              <span
                className="h-10 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: PARTY_COLORS[i % PARTY_COLORS.length] }}
              />
              <TextInput
                value={r.name}
                onChange={(e) =>
                  setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))
                }
                className="min-w-0 flex-1"
                placeholder={`Listina ${i + 1}`}
              />
              <NumberInput
                value={r.votes}
                onChange={(v) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, votes: v } : x)))}
                min={0}
                className="w-36 shrink-0"
                suffix="hl."
              />
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                className="btn-ghost shrink-0 px-2 py-2 text-brand-gray-dark hover:text-emap-red"
                aria-label={site.mandates.removeParty}
                disabled={rows.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { id: newId(), name: "", votes: 0 }])}
          className="btn-secondary mt-3 px-4 py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> {site.mandates.addParty}
        </button>
      </div>

      {/* Výsledky */}
      {!result || result.seatsAllocated === 0 ? (
        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-brand-gray-dark">
          {site.mandates.results.empty}
        </div>
      ) : (
        <>
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">{site.mandates.results.title}</h3>
              <span className="chip">
                {site.mandates.results.threshold}: {result.thresholdPercent} %
              </span>
            </div>
            <SeatChart data={seatData} totalSeats={result.seats} />
          </div>

          {result.notes.length > 0 && (
            <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              <Info className="h-4 w-4 shrink-0" />
              <div className="space-y-1">
                {result.notes.map((n, i) => (
                  <p key={i}>{n}</p>
                ))}
              </div>
            </div>
          )}

          <DHondtTableView result={result} colorFor={colorFor} />
        </>
      )}
    </div>
  );
}

function DHondtTableView({
  result,
  colorFor,
}: {
  result: NonNullable<ReturnType<typeof allocateSeats>>;
  colorFor: (id: string) => string;
}) {
  const { divisors, rows } = dhondtTable(result);
  const winningSet = new Set(result.winningQuotients.map((q) => `${q.partyId}#${q.divisor}`));
  // Zobrazíme dělitele až po nejvyšší dělitel, kterým byl přidělen mandát.
  const maxWinDiv = result.winningQuotients.reduce((m, q) => Math.max(m, q.divisor), 1);
  const shown = divisors.slice(0, maxWinDiv);

  return (
    <div className="card overflow-hidden p-0">
      <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-brand-blue">
        {site.mandates.results.table}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-slate-600">
              <th className="sticky left-0 z-10 bg-white px-4 py-2 text-left font-medium">Listina</th>
              {shown.map((d) => (
                <th key={d} className="px-3 py-2 text-right font-medium">
                  ÷{d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.partyId} className="border-t border-slate-100">
                <td className="sticky left-0 z-10 bg-white px-4 py-2">
                  <span className="inline-flex items-center gap-2 font-medium text-brand-blue">
                    <span className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: colorFor(row.partyId) }} />
                    <span className="max-w-[12rem] truncate">{row.partyName}</span>
                  </span>
                </td>
                {shown.map((d, i) => {
                  const v = row.values[i];
                  const win = winningSet.has(`${row.partyId}#${d}`);
                  return (
                    <td key={d} className="px-3 py-2 text-right tabular-nums">
                      {v == null ? (
                        <span className="text-slate-400">–</span>
                      ) : (
                        <span
                          className={
                            win
                              ? "rounded-md bg-brand-teal/20 px-1.5 py-0.5 font-bold text-brand-teal-dark"
                              : "text-slate-600"
                          }
                        >
                          {formatNumber(v, 1)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-5 py-2.5 text-[11px] text-brand-gray-dark">
        Zvýrazněné podíly = mandát. Zobrazeno do ÷{maxWinDiv} (poslední přidělený mandát). Postupující
        listiny dosáhly alespoň {result.thresholdPercent} %.
      </div>
    </div>
  );
}
