import { useEffect, useState } from "react";

export interface ObecIndexEntry {
  kod: string;
  nazev: string;
  okres: string;
  kraj: string;
  obyvatel: number;
  mandatu: number;
  /** NUTS kód okresu – klíč k detailnímu balíčku /data/okres/<nuts>.json */
  okresNuts: string;
}

export interface ObecStrana {
  nazev: string;
  hlasy: number;
  mandaty: number;
  kandidatu?: number;
}

export interface ObecDetail extends ObecIndexEntry {
  volicu: number;
  ucast: number; // %
  platneHlasy: number;
  strany: ObecStrana[];
}

type Status = "loading" | "ready" | "unavailable";

const BASE = import.meta.env.BASE_URL;

export function useObceIndex() {
  const [obce, setObce] = useState<ObecIndexEntry[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;
    fetch(`${BASE}data/obce-index.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: ObecIndexEntry[]) => {
        if (!alive) return;
        setObce(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!alive) return;
        setStatus("unavailable");
      });
    return () => {
      alive = false;
    };
  }, []);

  return { obce, status };
}

// Cache načtených okresních balíčků (znovuvybrání obce ve stejném okrese = bez fetch).
const okresCache = new Map<string, ObecDetail[]>();

export async function fetchObecDetail(okresNuts: string, kod: string): Promise<ObecDetail | null> {
  try {
    let bundle = okresCache.get(okresNuts);
    if (!bundle) {
      const r = await fetch(`${BASE}data/okres/${okresNuts}.json`);
      if (!r.ok) return null;
      bundle = (await r.json()) as ObecDetail[];
      okresCache.set(okresNuts, bundle);
    }
    return bundle.find((o) => o.kod === kod) ?? null;
  } catch {
    return null;
  }
}

/** Diakritika-insensitive normalizace pro vyhledávání. */
export function normalizeText(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}
