import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { MapPin, Search, X, Loader2, ChevronDown } from "lucide-react";
import {
  useObceIndex,
  fetchObecDetail,
  normalizeText,
  type ObecDetail,
  type ObecIndexEntry,
} from "@/hooks/useObce";
import { site } from "@/content/site";
import { formatNumber } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const matches = useMemo(() => {
    if (status !== "ready") return [];
    const q = normalizeText(query.trim());
    const base = q
      ? obce.filter((o) => normalizeText(o.nazev).includes(q))
      : obce;
    return base.slice(0, 40);
  }, [obce, query, status]);

  if (status === "unavailable") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
        <MapPin className="h-4 w-4 shrink-0" /> {site.obec.unavailable}
      </div>
    );
  }

  async function choose(o: ObecIndexEntry) {
    setBusy(true);
    const detail = await fetchObecDetail(o.okresNuts, o.kod);
    setBusy(false);
    setOpen(false);
    setQuery("");
    if (detail) onSelect(detail);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
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
                    <span className="min-w-0 flex-1 truncate font-medium text-brand-blue">{o.nazev}</span>
                    <span className="shrink-0 text-xs text-brand-gray-dark">
                      {o.okres} · {formatNumber(o.obyvatel)} ob.
                    </span>
                  </Command.Item>
                ))}
              </Command.List>
              <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-brand-gray-dark">
                {site.obec.source}
              </div>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {selected && (
        <button type="button" onClick={onClear} className="btn-ghost px-2.5 py-1.5 text-xs">
          <X className="h-3.5 w-3.5" /> {site.obec.clear}
        </button>
      )}
      <span className="text-xs text-brand-gray-dark">{site.obec.help}</span>
    </div>
  );
}
