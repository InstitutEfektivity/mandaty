# Data — komunální volby 2022

Statická data pro kalkulačku mandátů. Generováno skriptem `data/ingest.mjs`
(`npm run ingest`) z otevřených dat ČSÚ.

## Soubory

- `obce-index.json` — lehký index všech obcí (obecních zastupitelstev):
  `{ kod, nazev, okres, kraj, obyvatel, mandatu, okresNuts }`
- `okres/<okresNuts>.json` — detailní výsledky všech obcí v okresu:
  `{ kod, nazev, okres, kraj, obyvatel, mandatu, okresNuts, volicu, ucast, platneHlasy, strany[] }`
  kde `strany[] = { nazev, hlasy, mandaty, kandidatu? }`.

## Atribuce

**Zdroj dat: Český statistický úřad, volby.cz, komunální volby 2022, licence CC BY 4.0.**

- NUTS seznam okresů: <https://www.volby.cz/opendata/kv2022/KV_nuts.htm>
- Výsledky po okresech: `https://www.volby.cz/pls/kv2022/vysledky_obce_okres?datumvoleb=20220923&nuts=<NUTS>`
- Počty obyvatel: <https://www.volby.cz/opendata/kv2022/csv/kvrzcoco.csv>

Zahrnuta jsou pouze řádná obecní zastupitelstva (`OZNAC_TYPU="OBEC"`).
Vyloučeny jsou městské části a městské obvody (`OZNAC_TYPU="MCMO"` — Praha,
Brno, Ostrava, Plzeň); hlavní město Praha je zahrnuto jako jedno městské
zastupitelstvo (65 mandátů).
