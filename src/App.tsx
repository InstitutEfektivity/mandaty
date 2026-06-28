import { motion } from "framer-motion";
import { Calculator, ArrowRight, BookOpen } from "lucide-react";
import { site } from "@/content/site";
import { Header, Footer, CoBrand } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { QuorumCalculator } from "@/components/calculators/QuorumCalculator";
import { MandateCalculator } from "@/components/calculators/MandateCalculator";
import { KrizkovaniCalculator } from "@/components/calculators/KrizkovaniCalculator";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { About } from "@/components/About";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
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
          <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="container-max relative py-16 sm:py-24">
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="flex justify-center">
              <span className="chip border-brand-teal/30 bg-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" /> {site.hero.eyebrow}
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="show"
              custom={1}
              variants={fadeUp}
              className="mx-auto mt-6 max-w-4xl text-center font-display text-4xl font-bold leading-[1.1] sm:text-5xl md:text-6xl"
            >
              {site.hero.title}
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              custom={2}
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-center text-lg text-brand-gray-dark"
            >
              {site.hero.subtitle}
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              custom={3}
              variants={fadeUp}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a href="#kalkulacky" className="btn-primary px-7 py-3.5 text-base">
                <Calculator className="h-5 w-5" /> {site.hero.ctaPrimary}
              </a>
              <a href="#o-projektu" className="btn-secondary px-7 py-3.5 text-base">
                <BookOpen className="h-5 w-5" /> {site.hero.ctaSecondary}
              </a>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              custom={4}
              variants={fadeUp}
              className="mt-10 flex justify-center"
            >
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 backdrop-blur">
                <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-brand-gray-dark">
                  {site.brand.cooperation}
                </p>
                <CoBrand size="sm" className="justify-center" />
              </div>
            </motion.div>

            {/* Hero stats */}
            <motion.dl
              initial="hidden"
              animate="show"
              custom={5}
              variants={fadeUp}
              className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3"
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
            <h2 className="font-display text-3xl font-bold">Tři výpočty, jeden cíl</h2>
            <p className="mt-3 text-brand-gray-dark">{site.brand.claim}</p>
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
        <section className="container-max py-12 sm:py-16">
          <About />
        </section>

        {/* ── Newsletter ────────────────────────────────────────────────── */}
        <section className="container-max py-4">
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
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
        <ArrowRight className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-gray-dark">{intro}</p>
      </div>
    </div>
  );
}
