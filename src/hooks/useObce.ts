import { useEffect, useState } from "react";

export interface ObecIndexEntry {
  kod: string;
  nazev: string;
  okres: string;
  kraj: string;
  obyvatel: number;
  mandatu: number;
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

export async function fetchObecDetail(kod: string): Promise<ObecDetail | null> {
  try {
    const r = await fetch(`${BASE}data/obce/${kod}.json`);
    if (!r.ok) return null;
    return (await r.json()) as ObecDetail;
  } catch {
    return null;
  }
}

/** Diakritika-insensitive normalizace pro vyhledávání. */
export function normalizeText(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}
