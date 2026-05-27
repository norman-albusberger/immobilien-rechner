import type { Ergebnis } from '../types';
import { formatEuro } from '../lib/format';

interface Props {
  ergebnis: Ergebnis;
}

export function RateInfo({ ergebnis }: Props) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Annuität: Zins- und Tilgungsanteil
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <div className="text-xs text-gray-500">Annuität p.a.</div>
          <div className="text-lg font-semibold tabular-nums">
            {formatEuro(ergebnis.annuitaetJahr)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Zinsanteil (im Cashflow)</div>
          <div className="text-lg font-semibold tabular-nums">
            {formatEuro(ergebnis.zinsenCFAnteil)}
          </div>
          <div className="text-xs text-gray-500">
            voller Zinsanfall: {formatEuro(ergebnis.zinsenJahr)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tilgungsanteil</div>
          <div className="text-lg font-semibold tabular-nums">
            {formatEuro(ergebnis.tilgungCFAnteil)}
          </div>
        </div>
      </div>

      {ergebnis.rateDecktZinsenNicht && (
        <div className="mt-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          <strong>Warnung:</strong> Die monatliche Rate deckt die Zinsen nicht
          vollständig. Es entsteht ein Zins-Fehlbetrag von{' '}
          <strong>{formatEuro(ergebnis.zinsFehlbetrag)}</strong> p.a. — die
          Darlehensschuld wächst. Steuerlich werden trotzdem die vollen Zinsen
          (<strong>{formatEuro(ergebnis.zinsenJahr)}</strong>) als
          Werbungskosten angesetzt.
        </div>
      )}
    </section>
  );
}
