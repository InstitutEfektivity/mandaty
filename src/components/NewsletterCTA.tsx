import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { site } from "@/content/site";
import { Checkbox } from "@/components/ui";

type Status = "idle" | "sending" | "success" | "error";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent || !email) return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, consent, source: "mandaty-kalkulacka" }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setName("");
        setConsent(false);
      } else {
        const body = await res.json().catch(() => ({}));
        setStatus("error");
        setError(body?.error || site.newsletter.error);
      }
    } catch {
      setStatus("error");
      setError(site.newsletter.error);
    }
  }

  return (
    <section id="newsletter" className="scroll-mt-20">
      <div className="relative overflow-hidden rounded-4xl gradient-brand px-6 py-12 text-white shadow-cta sm:px-12">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Mail className="h-3.5 w-3.5" /> {site.newsletter.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">{site.newsletter.title}</h2>
            <p className="mt-3 max-w-md text-white/85">{site.newsletter.subtitle}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 text-brand-blue shadow-card-hover sm:p-7">
            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-brand-teal" />
                <p className="font-medium text-brand-blue">{site.newsletter.success}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label htmlFor="nl-email" className="field-label">
                    {site.newsletter.email}
                  </label>
                  <input
                    id="nl-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={site.newsletter.emailPlaceholder}
                    className="field-input"
                  />
                </div>
                <div>
                  <label htmlFor="nl-name" className="field-label">
                    {site.newsletter.name}
                  </label>
                  <input
                    id="nl-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field-input"
                  />
                </div>
                <Checkbox id="nl-consent" checked={consent} onChange={setConsent}>
                  {site.newsletter.consent}
                </Checkbox>

                {status === "error" && (
                  <p className="flex items-center gap-2 text-sm text-emap-red">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending" || !consent || !email}
                  className="btn-primary w-full py-3"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {site.newsletter.submitting}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> {site.newsletter.submit}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
