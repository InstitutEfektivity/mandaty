import { motion } from "framer-motion";
import { Calculator, ArrowRight, BookOpen } from "lucide-react";
import { site } from "@/content/site";
import { Header, Footer, CoBrand } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { HeroVisual } from "@/components/HeroVisual";
import { QuorumCalculator } from "@/components/calculators/QuorumCalculator";
import { MandateCalculator } from "@/components/calculators/MandateCalculator";
import { KrizkovaniCalculator } from "@/components/calculators/KrizkovaniCalculator";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { About } from "@/components/About";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function App() {
  return (
    <div id="top">
      <Header />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-teal/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="container-max relative py-16 sm:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Levý sloupec – text */}
              <div className="text-center lg:text-left">
                <motion.span
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="chip border-brand-teal/30 bg-white/80"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" /> {site.hero.eyebrow}
                </motion.span>

                <motion.h1
                  initial="hidden"
                  animate="show"
                  custom={1}
                  variants={fadeUp}
                  className="mt-6 font-display text-4xl font-bold leading-[1.1] sm:text-5xl"
                >
                  {site.hero.title}
                </motion.h1>

                <motion.p
                  initial="hidden"
                  animate="show"
                  custom={2}
                  variants={fadeUp}
                  className="mx-auto mt-6 max-w-xl text-lg text-brand-gray-dark lg:mx-0"
                >
                  {site.hero.subtitle}
                </motion.p>

                <motion.div
                  initial="hidden"
                  animate="show"
                  custom={3}
                  variants={fadeUp}
                  className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:items-start lg:justify-start"
                >
                  <a href="#kalkulacky" className="btn-primary px-7 py-3.5 text-base">
                    <Calculator className="h-5 w-5" /> {site.hero.ctaPrimary}
                  </a>
                  <a
                    href="#o-projektu"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-base font-semibold text-brand-blue transition hover:text-brand-teal-dark"
                  >
                    <BookOpen className="h-5 w-5" /> {site.hero.ctaSecondary}
                  </a>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="show"
                  custom={4}
                  variants={fadeUp}
                  className="mt-8 inline-block rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card"
                >
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-brand-gray-dark">
                    {site.brand.cooperation}
                  </p>
                  <CoBrand size="lg" className="flex-wrap justify-center lg:justify-start" />
                </motion.div>
              </div>

              {/* Pravý sloupec – živý produktový vizuál */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto w-full max-w-md lg:mx-0"
              >
                <HeroVisual />
              </motion.div>
            </div>

            {/* Hero stats */}
            <motion.dl
              initial="hidden"
              animate="show"
              custom={5}
              variants={fadeUp}
              className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3"
            >
              {site.hero.stats.map((s) => (
                <div key={s.value} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-card">
                  <dt className="font-display text-2xl font-bold gradient-text">{s.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-brand-gray-dark">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </section>

        {/* ── Kalkulačky ────────────────────────────────────────────────── */}
        <section id="kalkulacky" className="container-max scroll-mt-20 py-12 sm:py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Tři výpočty, jeden cíl</h2>
            <p className="mt-3 text-lg text-brand-gray-dark">{site.brand.claim}</p>
          </div>

          <Tabs defaultValue="quorum">
            <TabsList className="mx-auto mb-8 max-w-2xl">
              <TabsTrigger value="quorum">{site.tabs.quorum}</TabsTrigger>
              <TabsTrigger value="mandates">{site.tabs.mandates}</TabsTrigger>
              <TabsTrigger value="krizkovani">{site.tabs.krizkovani}</TabsTrigger>
            </TabsList>

            <div className="glass-card p-6 sm:p-8">
              <TabsContent value="quorum" className="focus-visible:outline-none">
                <CalcHeading title={site.quorum.title} intro={site.quorum.intro} />
                <QuorumCalculator />
              </TabsContent>
              <TabsContent value="mandates" className="focus-visible:outline-none">
                <CalcHeading title={site.mandates.title} intro={site.mandates.intro} />
                <MandateCalculator />
              </TabsContent>
              <TabsContent value="krizkovani" className="focus-visible:outline-none">
                <CalcHeading title={site.krizkovani.title} intro={site.krizkovani.intro} />
                <KrizkovaniCalculator />
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* ── O projektu ────────────────────────────────────────────────── */}
        <section className="bg-white">
          <div className="container-max py-12 sm:py-20">
            <About />
          </div>
        </section>

        {/* ── Newsletter ────────────────────────────────────────────────── */}
        <section className="container-max py-12 sm:py-16">
          <NewsletterCTA />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CalcHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal-dark">
        <ArrowRight className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-gray-dark">{intro}</p>
      </div>
    </div>
  );
}
