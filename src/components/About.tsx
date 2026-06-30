import { Github, Database, Scale, Target, ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";

export function About() {
  return (
    <section id="o-projektu" className="scroll-mt-20">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Proč */}
        <div>
          <span className="chip"><Target className="h-3.5 w-3.5 text-brand-teal" /> {site.about.title}</span>
          <h2 className="mt-4 font-display text-3xl font-bold">{site.about.why.h}</h2>
          <div className="mt-4 space-y-3 text-brand-gray-dark">
            {site.about.why.p.map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>
        </div>

        {/* Jak to funguje */}
        <div>
          <span className="chip"><Scale className="h-3.5 w-3.5 text-brand-teal" /> {site.about.method.h}</span>
          <p className="mt-4 leading-relaxed text-brand-gray-dark">{site.about.method.intro}</p>

          <div className="mt-6 space-y-4">
            {site.about.method.steps.map((s, i) => (
              <div key={i} className="card p-5">
                <h3 className="font-display text-base font-bold text-brand-blue">{s.h}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-gray-dark">{s.p}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-brand-blue p-6 text-white">
            <h3 className="flex items-center gap-2 font-display text-base font-bold">
              <Database className="h-5 w-5 text-brand-teal-light" /> {site.about.data.h}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{site.about.data.p}</p>
            <a
              href={site.about.data.repoUrl}
              target="_blank"
              rel="noopener"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              <Github className="h-4 w-4" /> {site.about.data.repo} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <p className="mt-4 text-xs leading-relaxed text-white/60">{site.about.data.disclaimer}</p>
          </div>
        </div>
      </div>

      {/* electionmap promo */}
      <div className="mt-12 overflow-hidden rounded-3xl bg-emap-navy text-white">
        <div className="grid items-center gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          <div>
            <div className="flex items-center gap-3">
              <img src="/emap-logo.svg" alt={site.brand.emapName} className="h-14 w-14 rounded-xl shadow-lg" />
              <span className="text-sm font-semibold uppercase tracking-wide text-white/60">
                {site.about.emap.eyebrow}
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">{site.about.emap.h}</h3>
            <p className="mt-3 max-w-xl text-white/80">{site.about.emap.p}</p>
            <a
              href={site.brand.emapUrl}
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-full bg-emap px-6 py-3 font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              {site.about.emap.cta} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <a
            href={site.brand.emapUrl}
            target="_blank"
            rel="noopener"
            className="group block overflow-hidden rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/5 transition hover:border-white/25"
            title={site.brand.emapName}
          >
            <img
              src="/emap-preview.webp"
              alt="Náhled aplikace ElectionMap.cz – dvě volební mapy okrsků vedle sebe"
              width={1280}
              height={625}
              loading="lazy"
              className="w-full transition duration-500 group-hover:scale-[1.02]"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
