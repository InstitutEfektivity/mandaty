import { formatNumber } from "@/lib/utils";

export const PARTY_COLORS = [
  "#1E3A5F", // brand blue
  "#2EC4B6", // brand teal
  "#1666D7", // emap blue
  "#E2A50F", // amber
  "#E21039", // red
  "#7C3AED", // violet
  "#0E9F6E", // green
  "#DB2777", // pink
  "#F97316", // orange
  "#0891B2", // cyan
];

export interface SeatDatum {
  id: string;
  name: string;
  seats: number;
  votes: number;
  color: string;
}

export function SeatChart({ data, totalSeats }: { data: SeatDatum[]; totalSeats: number }) {
  const withSeats = data.filter((d) => d.seats > 0);
  return (
    <div>
      {/* Mandátové „sedačky" */}
      <div className="flex flex-wrap gap-1.5" role="img" aria-label="Rozdělení mandátů">
        {withSeats.flatMap((d) =>
          Array.from({ length: d.seats }, (_, i) => (
            <span
              key={`${d.id}-${i}`}
              className="h-6 w-6 rounded-md shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: d.color }}
              title={`${d.name}: ${d.seats} mandátů`}
            />
          )),
        )}
        {withSeats.length === 0 &&
          Array.from({ length: totalSeats }, (_, i) => (
            <span key={i} className="h-6 w-6 rounded-md bg-slate-200" />
          ))}
      </div>

      {/* Legenda */}
      <div className="mt-5 space-y-2.5">
        {data
          .slice()
          .sort((a, b) => b.seats - a.seats || b.votes - a.votes)
          .map((d) => (
            <div key={d.id} className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: d.color }} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-brand-blue">{d.name}</span>
              <span className="text-sm tabular-nums text-brand-gray-dark">{formatNumber(d.votes)} hl.</span>
              <span className="w-16 text-right text-sm font-bold tabular-nums text-brand-blue">
                {d.seats} {seatWord(d.seats)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function seatWord(n: number): string {
  if (n === 1) return "mandát";
  if (n >= 2 && n <= 4) return "mandáty";
  return "mandátů";
}
