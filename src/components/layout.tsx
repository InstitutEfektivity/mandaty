import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Github } from "lucide-react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/* ── Co-brand lockup: Institut efektivity × electionmap.cz ─────────────── */
export function CoBrand({
  size = "sm",
  logosOnly = false,
  className,
}: {
  size?: "sm" | "lg";
  logosOnly?: boolean;
  className?: string;
}) {
  const logo = size === "lg" ? "h-9" : "h-7";
  const text = size === "lg" ? "text-base" : "text-sm";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <a
        href={site.brand.ieUrl}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-2 transition hover:opacity-80"
        title={site.brand.ieName}
      >
        <img src="/ie-logo.svg" alt={site.brand.ieName} className={cn(logo, "w-auto")} />
        {!logosOnly && <span className={cn("font-semibold text-brand-blue", text)}>{site.brand.ieName}</span>}
      </a>
      <span className={cn("text-brand-gray-dark/50", size === "lg" ? "text-xl" : "text-base")}>×</span>
      <a
        href={site.brand.emapUrl}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-2 transition hover:opacity-80"
        title={site.brand.emapName}
      >
        <img src="/emap-logo.svg" alt={site.brand.emapName} className={cn(logo, "w-auto rounded-md")} />
        {!logosOnly && <span className={cn("font-semibold text-emap-navy", text)}>{site.brand.emapName}</span>}
      </a>
    </div>
  );
}

const NAV = [
  { href: "#kalkulacky", label: site.nav.calculators },
  { href: "#o-projektu", label: site.nav.about },
  { href: "#newsletter", label: site.nav.newsletter },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-max flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-8 w-8" aria-hidden />
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-bold text-brand-blue">{site.brand.title}</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-brand-teal-dark">
              {site.brand.tagline}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="btn-ghost text-sm">
              {n.label}
            </a>
          ))}
          <CoBrand size="sm" logosOnly className="ml-2 hidden border-l border-slate-200 pl-3 lg:flex" />
          <a href="#newsletter" className="btn-primary ml-2 px-5 py-2 text-sm">
            {site.nav.cta}
          </a>
        </nav>

        <button
          className="btn-ghost md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200/70 bg-white md:hidden"
          >
            <div className="container-max flex flex-col gap-1 py-3">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-blue hover:bg-slate-100"
                >
                  {n.label}
                </a>
              ))}
              <a href="#newsletter" onClick={() => setOpen(false)} className="btn-primary mt-1 py-2.5 text-sm">
                {site.nav.cta}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-blue-dark text-white">
      <div className="container-max grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-8 w-8" aria-hidden />
            <span className="font-display text-lg font-bold">{site.brand.title}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/70">{site.brand.claim} {site.footer.mission}</p>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">
            {site.footer.project}
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <a href={site.brand.ieUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm font-semibold text-white transition hover:text-brand-teal-light">
              <img src="/ie-logo.svg" alt="" className="h-7 w-7 rounded bg-white p-0.5" aria-hidden />
              {site.brand.ieName} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <span className="text-xs text-white/50">{site.footer.cooperation}</span>
            <a href={site.brand.emapUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm font-semibold text-white transition hover:text-brand-teal-light">
              <img src="/emap-logo.svg" alt="" className="h-7 w-7 rounded" aria-hidden />
              {site.brand.emapName} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/60">
          <a href={site.about.data.repoUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-white transition hover:text-brand-teal-light">
            <Github className="h-4 w-4" /> {site.footer.sourceCode}
          </a>
          <p className="text-xs leading-relaxed">{site.footer.dataSource}</p>
          <p className="mt-2 text-xs text-white/40">© {new Date().getFullYear()} {site.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
