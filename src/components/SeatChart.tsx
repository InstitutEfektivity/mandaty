import { formatNumber } from "@/lib/utils";

// Harmonizovaná kategoriální paleta (sladěná s brandem, nižší sytost než default).
export const PARTY_COLORS = [
  "#1E3A5F", // brand blue
  "#2EC4B6", // brand teal
  "#5B8DEF", // soft blue
  "#E0A458", // amber
  "#D46A6A", // muted red
  "#7C77B9", // muted violet
  "#4FB286", // green
  "#C77DA8", // mauve
  "#E0875A", // soft orange
  "#4AA3B5", // cyan
];

export interface SeatDatum {
  id: string;
  name: string;
  seats: number;
  votes: number;
  color: string;
}

function seatWord(n: number): string {
  if (n === 1) return "mandát";
  if (n >= 2 && n <= 4) return "mandáty";
  return "mandátů";
}

export function SeatChart({ data, totalSeats }: { data: SeatDatum[]; totalSeats: number }) {
  const withSeats = data.filter((d) => d.seats > 0);
  const sorted = data.slice().sort((a, b) => b.seats - a.seats || b.votes - a.votes);

  return (
    <div>
      {/* Mandátové „sedačky" */}
      <div className="flex flex-wrap gap-1.5" role="img" aria-label={`Rozdělení ${totalSeats} mandátů`}>
        {withSeats.flatMap((d) =>
          Array.from({ length: d.seats }, (_, i) => (
            <span
              key={`${d.id}-${i}`}
              className="h-6 w-6 rounded-md shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: d.color }}
              title={`${d.name}: ${d.seats} ${seatWord(d.seats)}`}
            />
          )),
        )}
        {withSeats.length === 0 &&
          Array.from({ length: totalSeats }, (_, i) => (
            <span key={i} className="h-6 w-6 rounded-md bg-slate-200" />
          ))}
      </div>

      {/* Legenda – mandáty jako hlavní hodnota, hlasy sekundárně */}
      <div className="mt-5 divide-y divide-slate-100">
        {sorted.map((d) => (
          <div key={d.id} className="flex items-center gap-3 py-2">
            <span className="h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: d.color }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-brand-blue">{d.name}</div>
              <div className="text-xs tabular-nums text-brand-gray-dark">{formatNumber(d.votes)} hlasů</div>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-display text-2xl font-bold tabular-nums text-brand-blue">{d.seats}</span>
              <span className="ml-1 text-xs text-brand-gray-dark">{seatWord(d.seats)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
