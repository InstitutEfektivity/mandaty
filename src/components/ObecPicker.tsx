import { useEffect, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { MapPin, Search, X, Loader2, ChevronDown, RefreshCw, Radio, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  useObceIndex,
  useDataSource,
  fetchObecDetail,
  fetchObecDetailLive,
  normalizeText,
  type DataSource,
  type LiveInfo,
  type ObecDetail,
  type ObecIndexEntry,
} from "@/hooks/useObce";
import { site } from "@/content/site";
import { cn, formatNumber } from "@/lib/utils";

type LiveState =
  | { kind: "idle" }
  | { kind: "ok"; info: LiveInfo }
  | { kind: "error"; reason: "unavailable" | "not-found" };

function formatGenerated(iso: string): string {
  // ČSÚ: "2026-10-10T19:33:02" (lokální čas) → "19:33"
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  return m ? `${m[1]}:${m[2]}` : iso;
}

export function ObecPicker({
  selected,
  onSelect,
  onClear,
}: {
  selected: string | null;
  onSelect: (d: ObecDetail) => void;
  onClear: () => void;
}) {
  const { obce, status } = useObceIndex();
  const [source, setSource] = useDataSource();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<LiveState>({ kind: "idle" });
  const lastEntry = useRef<ObecIndexEntry | null>(null);

  const matches = useMemo(() => {
    if (status !== "ready") return [];
    const q = normalizeText(query.trim());
    const base = q
      ? obce.filter((o) => normalizeText(o.nazev).includes(q))
      : obce;
    return base.slice(0, 40);
  }, [obce, query, status]);

  async function load(o: ObecIndexEntry, src: DataSource, force = false) {
    setBusy(true);
    try {
      if (src === "2026") {
        const r = await fetchObecDetailLive(o, force);
        if (r.ok) {
          setLive({ kind: "ok", info: r.detail.live! });
          onSelect(r.detail);
        } else {
          setLive({ kind: "error", reason: r.reason });
        }
      } else {
        setLive({ kind: "idle" });
        const detail = await fetchObecDetail(o.okresNuts, o.kod);
        if (detail) onSelect(detail);
      }
    } finally {
      setBusy(false);
    }
  }

  async function choose(o: ObecIndexEntry) {
    lastEntry.current = o;
    setOpen(false);
    setQuery("");
    await load(o, source);
  }

  // Přepnutí zdroje s vybranou obcí → znovu načíst ze zvoleného zdroje.
  useEffect(() => {
    if (lastEntry.current && selected) void load(lastEntry.current, source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  function clear() {
    lastEntry.current = null;
    setLive({ kind: "idle" });
    onClear();
  }

  if (status === "unavailable") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
        <MapPin className="h-4 w-4 shrink-0" /> {site.obec.unavailable}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <SourceSwitch value={source} onChange={setSource} />

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-brand-blue shadow-sm transition hover:border-brand-teal"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin text-brand-gray-dark" />
              ) : (
                <MapPin className="h-4 w-4 text-brand-teal" />
              )}
              <span>{selected ?? site.obec.label}</span>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4 text-brand-gray-dark" />}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="z-50 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover"
            >
              <Command shouldFilter={false} className="flex flex-col">
                <div className="flex items-center gap-2 border-b border-slate-100 px-3">
                  <Search className="h-4 w-4 text-brand-gray-dark" />
                  <Command.Input
                    autoFocus
                    value={query}
                    onValueChange={setQuery}
                    placeholder={site.obec.placeholder}
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-brand-gray-dark/70"
                  />
                </div>
                <Command.List className="max-h-72 overflow-y-auto p-1.5">
                  {matches.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-brand-gray-dark">{site.obec.none}</div>
                  )}
                  {matches.map((o) => (
                    <Command.Item
                      key={o.kod}
                      value={`${o.nazev} ${o.okres} ${o.kod}`}
                      onSelect={() => choose(o)}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-brand-teal/10"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-brand-blue">
                        {o.typ === "MC" && (
                          <span className="mr-1.5 rounded bg-brand-teal/10 px-1 py-0.5 text-[10px] font-semibold text-brand-teal-dark">
                            MČ
                          </span>
                        )}
                        {o.nazev}
                      </span>
                      <span className="shrink-0 text-xs text-brand-gray-dark">
                        {o.okres} · {formatNumber(o.obyvatel)} ob.
                      </span>
                    </Command.Item>
                  ))}
                </Command.List>
                <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-brand-gray-dark">
                  {site.obec.source[source]}
                </div>
              </Command>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {selected && (
          <button type="button" onClick={clear} className="btn-ghost px-2.5 py-1.5 text-xs">
            <X className="h-3.5 w-3.5" /> {site.obec.clear}
          </button>
        )}
      </div>

      {source === "2026" && live.kind !== "idle" ? (
        <LiveStatus
          state={live}
          busy={busy}
          onRefresh={() => lastEntry.current && load(lastEntry.current, "2026", true)}
        />
      ) : (
        <span className="text-xs text-brand-gray-dark">{site.obec.help[source]}</span>
      )}
    </div>
  );
}

/* ── Přepínač zdroje dat ─────────────────────────────────────────────────── */

function SourceSwitch({ value, onChange }: { value: DataSource; onChange: (s: DataSource) => void }) {
  const t = site.obec.sourceSwitch;
  const opts: DataSource[] = ["2026", "2022"];
  return (
    <div
      role="radiogroup"
      aria-label={t.ariaLabel}
      className="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-0.5 text-xs font-semibold"
    >
      {opts.map((s) => {
        const active = s === value;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(s)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 transition",
              active ? "bg-white text-brand-blue shadow-sm" : "text-brand-gray-dark hover:text-brand-blue",
            )}
          >
            {s === "2026" && (
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full bg-emap-red opacity-75",
                    active && "animate-ping",
                  )}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emap-red" />
              </span>
            )}
            {t[s]}
            {s === "2026" && (
              <span className="rounded bg-emap-red/10 px-1 py-0.5 text-[10px] uppercase tracking-wide text-emap-red">
                {t["2026badge"]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Stav průběžného sčítání ─────────────────────────────────────────────── */

function LiveStatus({
  state,
  busy,
  onRefresh,
}: {
  state: Exclude<LiveState, { kind: "idle" }>;
  busy: boolean;
  onRefresh: () => void;
}) {
  const t = site.obec.live;

  if (state.kind === "error") {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="flex-1">{state.reason === "not-found" ? t.notFound : t.unavailable}</span>
        <button type="button" onClick={onRefresh} className="inline-flex items-center gap-1 font-semibold hover:underline">
          <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} /> {t.refresh}
        </button>
      </div>
    );
  }

  const { info } = state;
  const complete = info.spocteno || info.okrskyProc >= 100;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-3.5 py-2.5 text-xs",
        complete ? "border-brand-teal/40 bg-brand-teal/5 text-brand-teal-dark" : "border-emap-red/30 bg-emap-red/5 text-brand-blue",
      )}
    >
      {complete ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-teal" />
      ) : (
        <Radio className="h-4 w-4 shrink-0 text-emap-red" />
      )}
      <span className="font-semibold">
        {complete ? t.complete : `${t.counted} ${formatNumber(info.okrskyProc, 0)} % ${t.okrsky}`}
      </span>
      <span className="text-brand-gray-dark">
        ({formatNumber(info.okrskyZprac)}/{formatNumber(info.okrskyCelkem)}) · {t.asOf} {formatGenerated(info.generovano)}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={busy}
        className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline disabled:opacity-60"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} /> {t.refresh}
      </button>
      {!complete && (
        <span className="basis-full text-[11px] text-brand-gray-dark">
          {t.partial}
          {info.volicuZ2022 && ` ${t.partialVoters}`}
        </span>
      )}
    </div>
  );
}
