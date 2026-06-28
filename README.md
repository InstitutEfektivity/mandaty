# Kalkulačka mandátů

Bezplatná webová kalkulačka pro **komunální volby** (volby do zastupitelstev obcí):

- **Kolik hlasů potřebujete na 1 % a na mandát** – kampaňová matematika s rozlišením „hlasy vs. lidé" (každý volič má v komunálu tolik hlasů, kolik se volí zastupitelů).
- **Přepočet hlasů na mandáty** – přesně dle **D'Hondtovy metody** a zákona č. 491/2001 Sb. (§ 34 a § 45), vč. 5% vstupní klauzule s přepočteným základem.
- **Křížkování (panašování)** – vysvětlení, jak a proč křížkovat, a co to dělá s pořadím kandidátů (preferenční posun).

> Projekt **[Institutu efektivity](https://institutefektivity.cz)** ve spolupráci s **[electionmap.cz](https://electionmap.cz)**.
> Claim: *Postavte kampaň na datech.*

## Přesnost výpočtu

Algoritmus rozdělení mandátů je implementován dle primárního zdroje:
**ČSÚ – „Podrobný popis postupu při rozdělování mandátů ve volbách do zastupitelstev obcí" (volby.cz, 15. 6. 2022)** a zákona č. 491/2001 Sb. Kritická pravidla:

- přepočtený základ = `(H / S) × min(kp, S)`,
- vstupní klauzule 5 % (snižovaná po 1 %, pokud nepostoupí ≥ 2 listiny),
- D'Hondtovy podíly `hlasy / 1, 2, 3, …`,
- preferenční posun: hranice = `celá_část(hlasy/kp) × 1,1`, kandidát s hlasy **≥** hranice se posune.

Vše ověřeno automatickými testy proti oficiálnímu příkladu ČSÚ (`src/lib/dhondt.test.ts`).

## Data

Historická volební data a počty obyvatel se předzpracovávají z otevřených dat:

- **ČSÚ / volby.cz** – výsledky komunálních voleb (XML endpointy, UTF-8),
- **ČSÚ** – počet obyvatel obcí.

Licence vstupních dat: **CC BY 4.0**. Zdroj dat: Český statistický úřad (volby.cz).

## Vývoj

```bash
npm install
npm run dev      # http://localhost:5180
npm test         # unit testy algoritmu
npm run build    # produkční build do dist/
npm run ingest   # předzpracování opendat do public/data/ (volitelné)
```

Stack: Vite + React + TypeScript + Tailwind CSS.

---

© Institut efektivity. Zdroj volebních dat: Český statistický úřad (volby.cz), CC BY 4.0.
