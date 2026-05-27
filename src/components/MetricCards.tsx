import type { Ergebnis } from '../types';
import { formatEuro, formatEuroSigned, formatPercent } from '../lib/format';

interface Props {
  ergebnis: Ergebnis;
}

function Card({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: 'blue' | 'green' | 'pink' | 'gray';
}) {
  const accentClasses: Record<typeof accent, string> = {
    blue: 'border-[#185FA5]/30 text-[#185FA5]',
    green: 'border-[#0F6E56]/30 text-[#0F6E56]',
    pink: 'border-[#D4537E]/30 text-[#D4537E]',
    gray: 'border-gray-300 text-gray-700',
  };
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${accentClasses[accent]}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

export function MetricCards({ ergebnis }: Props) {
  const eff = ergebnis.effektivSatz;
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        label="Steuerersparnis / -last"
        value={formatEuroSigned(ergebnis.steuerersparnis)}
        sub={`ohne: ${formatEuro(ergebnis.steuerOhne)} · mit: ${formatEuro(ergebnis.steuerMit)}`}
        accent="pink"
      />
      <Card
        label="Einkünfte aus V & V"
        value={formatEuroSigned(ergebnis.einkuenfteVV)}
        sub={`Miete ${formatEuro(ergebnis.mieteinnahmen)} − WK ${formatEuro(ergebnis.werbungskosten)}`}
        accent="blue"
      />
      <Card
        label="Cashflow nach Steuern"
        value={formatEuroSigned(ergebnis.cashflowNachSteuer)}
        sub={`vor Steuern: ${formatEuroSigned(ergebnis.cashflowVorSteuer)}`}
        accent="green"
      />
      <Card
        label="Grenzsteuersatz"
        value={formatPercent(ergebnis.grenzsteuersatz)}
        sub={
          eff === null
            ? 'Effektivsatz n/a'
            : `Effektivsatz V&V: ${formatPercent(eff)}`
        }
        accent="gray"
      />
    </section>
  );
}
