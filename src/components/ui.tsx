import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Tabs ──────────────────────────────────────────────────────────────── */
export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex w-full flex-col gap-1 rounded-2xl border border-slate-200 bg-white/70 p-1.5 backdrop-blur sm:flex-row",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-gray-dark transition-all",
        "hover:text-brand-blue",
        "data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;

/* ── Number input ──────────────────────────────────────────────────────── */
interface NumberInputProps {
  id?: string;
  value: number | "";
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  placeholder?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className,
  ...rest
}: NumberInputProps) {
  return (
    <div className={cn("relative", className)}>
      <input
        type="number"
        inputMode="numeric"
        className={cn(
          "field-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          suffix ? "pr-12" : "pr-3.5",
        )}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = e.target.valueAsNumber;
          onChange(Number.isNaN(n) ? 0 : n);
        }}
        {...rest}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-brand-gray-dark">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ── Text input ────────────────────────────────────────────────────────── */
export function TextInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("field-input", className)} {...props} />;
}

/* ── Slider ────────────────────────────────────────────────────────────── */
interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}

export function Slider({ value, onChange, min, max, step = 1 }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className="relative flex h-5 w-full touch-none select-none items-center"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0] ?? min)}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-slate-200">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-teal" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block h-5 w-5 rounded-full border-2 border-brand-teal bg-white shadow-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
        aria-label="Hodnota"
      />
    </SliderPrimitive.Root>
  );
}

/* ── Checkbox ──────────────────────────────────────────────────────────── */
interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}

export function Checkbox({ id, checked, onChange, children }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-brand-gray-dark">
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(c === true)}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white transition data-[state=checked]:border-brand-teal data-[state=checked]:bg-brand-teal"
      >
        <CheckboxPrimitive.Indicator>
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="leading-snug">{children}</span>
    </label>
  );
}

/* ── Field wrapper ─────────────────────────────────────────────────────── */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-snug text-brand-gray-dark">{hint}</p>}
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition",
        accent
          ? "border-transparent gradient-brand text-white shadow-cta"
          : "border-slate-200 bg-white shadow-card",
      )}
    >
      <div className={cn("text-xs font-semibold uppercase tracking-wide", accent ? "text-white/80" : "text-brand-gray-dark")}>
        {label}
      </div>
      <div className={cn("mt-1 font-display text-3xl font-bold", accent ? "text-white" : "text-brand-blue")}>
        {value}
      </div>
      {sub && <div className={cn("mt-1 text-sm", accent ? "text-white/80" : "text-brand-gray-dark")}>{sub}</div>}
    </div>
  );
}
