import { motion } from "framer-motion";
import { PARTY_COLORS } from "@/components/SeatChart";

// Ilustrativní rozdělení mandátů pro hero (živý produktový vizuál).
const DIST = [
  { name: "Listina A", seats: 7, color: PARTY_COLORS[0]! },
  { name: "Listina B", seats: 6, color: PARTY_COLORS[1]! },
  { name: "Listina C", seats: 4, color: PARTY_COLORS[2]! },
  { name: "Listina D", seats: 4, color: PARTY_COLORS[3]! },
];
const TOTAL = DIST.reduce((a, d) => a + d.seats, 0);
const squares = DIST.flatMap((d) => Array.from({ length: d.seats }, () => d.color));

export function HeroVisual() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-brand-teal/20 blur-2xl" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card relative overflow-hidden p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray-dark">
              Rozdělení mandátů
            </div>
            <div className="font-display text-lg font-bold text-brand-blue">
              Zastupitelstvo · {TOTAL} mandátů
            </div>
          </div>
          <span className="chip border-brand-teal/30">D'Hondt</span>
        </div>

        {/* Animované „sedačky" */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {squares.map((c, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.045, duration: 0.35, ease: "backOut" }}
              className="h-6 w-6 rounded-md shadow-sm"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Mini legenda */}
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
          {DIST.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: d.color }} />
              <span className="flex-1 truncate text-sm text-brand-blue">{d.name}</span>
              <span className="text-sm font-bold tabular-nums text-brand-blue">{d.seats}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Plovoucí statistika */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="absolute -bottom-5 -left-4 rounded-2xl bg-brand-blue px-4 py-3 text-white shadow-card-hover"
      >
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">1 % znamená</div>
        <div className="font-display text-xl font-bold">304 hlasů</div>
      </motion.div>
    </div>
  );
}
