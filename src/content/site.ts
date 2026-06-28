/**
 * Veškeré české texty webu na jednom místě (snadná revize copy).
 * Česká typografie: pomlčka „ – “ (en dash s mezerami), NIKDY „—“.
 */

export const site = {
  brand: {
    title: "Kalkulačka mandátů",
    tagline: "komunální volby",
    claim: "Postavte kampaň na datech.",
    ieName: "Institut efektivity",
    ieUrl: "https://institutefektivity.cz",
    emapName: "electionmap.cz",
    emapUrl: "https://electionmap.cz",
    cooperation: "Projekt Institutu efektivity ve spolupráci s electionmap.cz",
  },

  nav: {
    calculators: "Kalkulačky",
    about: "O projektu",
    method: "Jak to funguje",
    newsletter: "Newsletter",
    cta: "Odebírat novinky",
  },

  hero: {
    eyebrow: "Bezplatný nástroj pro volební kampaně",
    title: "Kolik hlasů potřebujete, aby se z nich staly mandáty?",
    subtitle:
      "Spočítejte si, kolik hlasů znamená 1 % i jeden mandát, přepočtěte výsledky D'Hondtovou metodou a pochopte, jak funguje křížkování. Bez registrace, na datech, podle skutečných pravidel komunálních voleb.",
    ctaPrimary: "Začít počítat",
    ctaSecondary: "Jak výpočet funguje",
    stats: [
      { value: "491/2001", label: "podle zákona o volbách do zastupitelstev obcí" },
      { value: "D'Hondt", label: "přesný přepočet hlasů na mandáty" },
      { value: "6 250+", label: "obcí s předvyplněnými daty z minulých voleb" },
    ],
  },

  tabs: {
    quorum: "Kolik hlasů potřebuji",
    mandates: "Přepočet na mandáty",
    krizkovani: "Křížkování",
  },

  quorum: {
    title: "Kolik hlasů potřebujete na 1 % a na mandát",
    intro:
      "V komunálních volbách má každý volič tolik hlasů, kolik se volí zastupitelů. Proto se vyplatí rozlišovat „hlasy“ a „lidi“ – jeden volič, který zakroužkuje celou vaši kandidátku, vám dá tolik hlasů, kolik je mandátů.",
    inputs: {
      voters: "Počet voličů v obci (zapsaní v seznamu)",
      turnout: "Očekávaná volební účast",
      seats: "Počet volených zastupitelů",
      fillRate: "Míra využití hlasů",
      fillRateHelp:
        "Kolik ze svých hlasů volič v průměru reálně použije. 100 % = volí celou kandidátku, méně = víc kroužkuje jednotlivce.",
    },
    results: {
      onePercent: "1 % znamená",
      perSeat: "Na 1 mandát přibližně",
      threshold: "Na 5% vstupní hranici",
      votesUnit: "hlasů",
      peopleUnit: "lidí",
      peopleHint: "(voličů, kteří dají celou kandidátku)",
      totalVotes: "Odhad všech platných hlasů v obci",
      note:
        "Hodnoty jsou orientační. „Na mandát“ je hrubý odhad (celkové hlasy ÷ mandáty); skutečná cena posledního mandátu se liší podle rozložení sil mezi stranami – přesně to spočítá záložka „Přepočet na mandáty“.",
    },
  },

  mandates: {
    title: "Přepočet hlasů na mandáty (D'Hondtova metoda)",
    intro:
      "Zadejte počet mandátů a hlasy jednotlivých kandidátek. Kalkulačka rozdělí mandáty přesně podle zákona č. 491/2001 Sb. – včetně 5% vstupní hranice a D'Hondtovy metody.",
    seats: "Počet volených zastupitelů",
    partyName: "Kandidátní listina",
    partyVotes: "Počet hlasů",
    addParty: "Přidat kandidátku",
    removeParty: "Odebrat",
    compute: "Spočítat mandáty",
    candidatesHint: "počet kandidátů",
    results: {
      title: "Rozdělení mandátů",
      seats: "mandátů",
      didNotAdvance: "nepostoupila (pod hranicí)",
      threshold: "Vstupní hranice",
      table: "D'Hondtova tabulka podílů",
      empty: "Zadejte alespoň dvě kandidátky s hlasy.",
    },
  },

  krizkovani: {
    title: "Křížkování (panašování) – jak a proč",
    intro:
      "Volič nemusí dát hlas jen jedné straně. Může „křížkovat“ – rozdělit své hlasy mezi konkrétní kandidáty napříč listinami. Křížkování může změnit pořadí, v jakém se rozdělují mandáty uvnitř kandidátky.",
    how: [
      {
        h: "Máte tolik hlasů, kolik se volí zastupitelů",
        p: "Volí-li se 25 zastupitelů, máte 25 hlasů. Můžete je rozdat napříč stranami.",
      },
      {
        h: "Tři způsoby, jak volit",
        p: "Označit celou stranu (hlasy dostanou její kandidáti odshora), kroužkovat jednotlivce napříč listinami, nebo obojí zkombinovat.",
      },
      {
        h: "Preferenční posun",
        p: "Kandidát, který získá alespoň o 10 % víc hlasů než je průměr jeho kandidátky, se posune na začátek – i kdyby byl na listině dole.",
      },
    ],
    sim: {
      title: "Vyzkoušejte preferenční posun",
      intro:
        "Zadejte hlasy jednotlivých kandidátů jedné kandidátky a počet mandátů, které získala. Uvidíte, kdo bude zvolen a koho křížky posunuly.",
      seats: "Mandáty, které kandidátka získala",
      candidateVotes: "Hlasy kandidátů (v pořadí na listině)",
      addCandidate: "Přidat kandidáta",
      threshold: "Hranice pro posun",
      elected: "Zvolen",
      substitute: "Náhradník",
      jumped: "posun preferencí",
    },
  },

  obec: {
    label: "Předvyplnit z minulých voleb",
    placeholder: "Vyhledejte obec…",
    help: "Načte počet voličů, mandátů a výsledky z komunálních voleb 2022.",
    clear: "Vymazat obec",
    loading: "Načítám data obcí…",
    unavailable: "Data obcí se nepodařilo načíst – zadejte hodnoty ručně.",
    none: "Žádná obec nenalezena.",
    source: "Zdroj: ČSÚ, komunální volby 2022",
  },

  newsletter: {
    eyebrow: "Newsletter Institutu efektivity",
    title: "Chcete víc nástrojů a dat pro lepší politiku?",
    subtitle:
      "Institut efektivity staví otevřené nástroje nad veřejnými daty. Nechte nám e-mail a dáme vědět, až přibude další – predikce výsledků, volební kalkulačka i analýzy pro veřejnou správu.",
    email: "Váš e-mail",
    emailPlaceholder: "jmeno@email.cz",
    name: "Jméno (nepovinné)",
    consent:
      "Souhlasím se zpracováním e-mailu za účelem zasílání novinek Institutu efektivity. Odhlásit se lze kdykoli.",
    submit: "Odebírat novinky",
    submitting: "Odesílám…",
    success: "Hotovo! Potvrďte prosím odběr v e-mailu, který jsme vám poslali.",
    error: "Něco se nepovedlo. Zkuste to prosím znovu.",
  },

  about: {
    title: "O projektu",
    why: {
      h: "Proč kalkulačku děláme",
      p: [
        "Komunální volby rozhoduje překvapivě málo hlasů. V menších obcích může o mandátu rozhodnout pár desítek lidí – a přesto většina kandidátek plánuje kampaň od oka, bez čísel.",
        "Institut efektivity staví otevřené nástroje nad veřejnými daty. Tahle kalkulačka má jediný cíl: dát všem kandidátkám – velkým i malým – stejný přístup k tomu, co data o volbách říkají. Když budou kampaně stavět na faktech, vyhraje kvalita.",
        "Nástroj vzniká ve spolupráci s electionmap.cz, mapou volebních okrsků pro plánování kampaní. Kalkulačka ukáže, kolik hlasů potřebujete; electionmap.cz ukáže, kde je hledat.",
      ],
    },
    method: {
      h: "Jak výpočet funguje",
      intro:
        "Počítáme přesně podle zákona č. 491/2001 Sb., o volbách do zastupitelstev obcí, a oficiální metodiky Českého statistického úřadu (15. 6. 2022). Žádné zjednodušení – stejný postup, jakým se rozdělují mandáty doopravdy.",
      steps: [
        {
          h: "1. Vstupní hranice (5 %)",
          p: "Pro každou kandidátku se spočítá „přepočtený základ“ = celkový počet platných hlasů v obci dělený počtem mandátů a vynásobený počtem jejích kandidátů (nejvýše počtem mandátů). Do rozdělování postupují listiny, které dosáhly alespoň 5 % na tomto základu. Pokud by nepostoupily aspoň dvě, hranice se snižuje po 1 %.",
        },
        {
          h: "2. D'Hondtova metoda",
          p: "Hlasy každé postupující listiny se dělí čísly 1, 2, 3, … Všechny podíly se seřadí od největšího a tolik nejvyšších, kolik je mandátů, získává po jednom mandátu. Při rovnosti podílů rozhoduje vyšší celkový počet hlasů, pak los.",
        },
        {
          h: "3. Kdo z kandidátky uspěje",
          p: "Mandáty připadnou kandidátům v pořadí na listině. Výjimka: kdo získá alespoň o 10 % hlasů víc, než je průměr kandidátky, posune se na začátek (mezi sebou podle počtu hlasů). To je síla křížkování.",
        },
      ],
    },
    data: {
      h: "Data a otevřenost",
      p: "Předvyplněná data o obcích (počet voličů, mandátů a výsledky) pocházejí z otevřených dat Českého statistického úřadu (volby.cz), komunální volby 2022, licence CC BY 4.0. Kód kalkulačky je veřejný na GitHubu.",
      repo: "Zdrojový kód na GitHubu",
      repoUrl: "https://github.com/InstitutEfektivity/mandaty",
      disclaimer:
        "Kalkulačka slouží k plánování a vzdělávání. Výsledky jsou orientační a nenahrazují oficiální výsledky voleb vyhlášené ČSÚ.",
    },
  },

  footer: {
    project: "Projekt Institutu efektivity",
    cooperation: "ve spolupráci s",
    dataSource: "Zdroj volebních dat: Český statistický úřad (volby.cz), CC BY 4.0",
    mission: "Děláme práci, kterou má dělat stát – a děláme ji z dat.",
    sourceCode: "Zdrojový kód",
    rights: "Institut efektivity",
  },
} as const;
