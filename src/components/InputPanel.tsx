import type { AfaSatz, Eingaben, Kirchensteuersatz, Veranlagung } from '../types';

interface Props {
  eingaben: Eingaben;
  onChange: (next: Eingaben) => void;
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <div className="relative">
        <input
          type="number"
          className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#185FA5] focus:outline-none focus:ring-1 focus:ring-[#185FA5]"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-gray-200 bg-white p-3">
      <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </legend>
      <div className="flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}

export function InputPanel({ eingaben, onChange }: Props) {
  const set = <K extends keyof Eingaben>(key: K, value: Eingaben[K]) =>
    onChange({ ...eingaben, [key]: value });

  return (
    <aside className="flex w-full flex-col gap-3 lg:w-[280px] lg:shrink-0">
      <h2 className="text-lg font-semibold text-gray-800">Eingaben</h2>

      <Section title="Einkommen">
        <NumberField
          label="Zu versteuerndes Einkommen (ohne Immobilie)"
          value={eingaben.zvE}
          onChange={(v) => set('zvE', v)}
          step={500}
          min={0}
          suffix="€"
        />
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">Veranlagung</span>
          <select
            className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#185FA5] focus:outline-none focus:ring-1 focus:ring-[#185FA5]"
            value={eingaben.veranlagung}
            onChange={(e) => set('veranlagung', e.target.value as Veranlagung)}
          >
            <option value="einzel">Einzel</option>
            <option value="zusammen">Zusammen</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">Kirchensteuer</span>
          <select
            className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#185FA5] focus:outline-none focus:ring-1 focus:ring-[#185FA5]"
            value={eingaben.kirchensteuer}
            onChange={(e) =>
              set('kirchensteuer', parseFloat(e.target.value) as Kirchensteuersatz)
            }
          >
            <option value={0}>keine</option>
            <option value={0.08}>8 % (BY, BW)</option>
            <option value={0.09}>9 %</option>
          </select>
        </label>
      </Section>

      <Section title="Objekt & Miete">
        <NumberField
          label="Monatsmiete (kalt)"
          value={eingaben.monatsmiete}
          onChange={(v) => set('monatsmiete', v)}
          step={50}
          min={0}
          suffix="€"
        />
        <NumberField
          label="Kaufpreis"
          value={eingaben.kaufpreis}
          onChange={(v) => set('kaufpreis', v)}
          step={1000}
          min={0}
          suffix="€"
        />
        <NumberField
          label="Gebäudeanteil (0–1)"
          value={eingaben.gebaeudeanteil}
          onChange={(v) => set('gebaeudeanteil', v)}
          step={0.05}
          min={0}
          max={1}
        />
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">AfA-Satz</span>
          <select
            className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#185FA5] focus:outline-none focus:ring-1 focus:ring-[#185FA5]"
            value={eingaben.afaSatz}
            onChange={(e) => set('afaSatz', parseFloat(e.target.value) as AfaSatz)}
          >
            <option value={0.02}>2 % linear (Bestand)</option>
            <option value={0.03}>3 % linear (ab 2023)</option>
          </select>
        </label>
      </Section>

      <Section title="Finanzierung">
        <NumberField
          label="Darlehensbetrag"
          value={eingaben.darlehensbetrag}
          onChange={(v) => set('darlehensbetrag', v)}
          step={1000}
          min={0}
          suffix="€"
        />
        <NumberField
          label="Zinssatz (Dezimal)"
          value={eingaben.zinssatz}
          onChange={(v) => set('zinssatz', v)}
          step={0.001}
          min={0}
          max={1}
        />
        <NumberField
          label="Monatliche Rate"
          value={eingaben.monatlicherRate}
          onChange={(v) => set('monatlicherRate', v)}
          step={50}
          min={0}
          suffix="€"
        />
      </Section>

      <Section title="Laufende Kosten (Jahr)">
        <NumberField
          label="Hausgeld"
          value={eingaben.hausgeld}
          onChange={(v) => set('hausgeld', v)}
          step={100}
          min={0}
          suffix="€"
        />
        <NumberField
          label="Grundsteuer"
          value={eingaben.grundsteuer}
          onChange={(v) => set('grundsteuer', v)}
          step={50}
          min={0}
          suffix="€"
        />
        <NumberField
          label="Verwaltung"
          value={eingaben.verwaltung}
          onChange={(v) => set('verwaltung', v)}
          step={50}
          min={0}
          suffix="€"
        />
        <NumberField
          label="Instandhaltung"
          value={eingaben.instandhaltung}
          onChange={(v) => set('instandhaltung', v)}
          step={50}
          min={0}
          suffix="€"
        />
        <NumberField
          label="Sonstige Werbungskosten"
          value={eingaben.sonstigeWK}
          onChange={(v) => set('sonstigeWK', v)}
          step={50}
          min={0}
          suffix="€"
        />
      </Section>
    </aside>
  );
}
