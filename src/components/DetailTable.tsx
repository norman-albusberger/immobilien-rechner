import type { Ergebnis } from '../types';
import { formatEuro, formatEuroSigned } from '../lib/format';

interface Props {
  ergebnis: Ergebnis;
}

function Row({
  label,
  value,
  bold,
  indent,
  signed,
}: {
  label: string;
  value: number;
  bold?: boolean;
  indent?: boolean;
  signed?: boolean;
}) {
  return (
    <tr className={bold ? 'border-t border-gray-200 font-semibold' : ''}>
      <td className={`py-1.5 pr-3 ${indent ? 'pl-4' : ''} text-gray-700`}>
        {label}
      </td>
      <td className="py-1.5 text-right tabular-nums text-gray-900">
        {signed ? formatEuroSigned(value) : formatEuro(value)}
      </td>
    </tr>
  );
}

export function DetailTable({ ergebnis }: Props) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Steuerliche Berechnung
        </h3>
        <table className="w-full text-sm">
          <tbody>
            <Row label="Mieteinnahmen p.a." value={ergebnis.mieteinnahmen} />
            <Row label="− Zinsen (voll)" value={-ergebnis.zinsenJahr} signed indent />
            <Row label="− AfA" value={-ergebnis.afaJahr} signed indent />
            <Row label="− Laufende Kosten" value={-ergebnis.laufendeKosten} signed indent />
            <Row label="Werbungskosten gesamt" value={-ergebnis.werbungskosten} signed bold />
            <Row label="Einkünfte aus V & V" value={ergebnis.einkuenfteVV} signed bold />
            <tr className="border-t border-gray-200">
              <td className="py-1.5 pr-3 text-gray-700">zvE ohne Immobilie</td>
              <td className="py-1.5 text-right tabular-nums">{formatEuro(ergebnis.zveOhne)}</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 text-gray-700">zvE mit Immobilie</td>
              <td className="py-1.5 text-right tabular-nums">{formatEuro(ergebnis.zveMit)}</td>
            </tr>
            {ergebnis.verlustVortrag > 0 && (
              <>
                <tr>
                  <td className="py-1.5 pl-4 pr-3 text-xs text-gray-500">
                    genutzter Verlust
                  </td>
                  <td className="py-1.5 text-right text-xs tabular-nums text-gray-500">
                    {formatEuro(ergebnis.genutzterVerlust)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-4 pr-3 text-xs text-gray-500">
                    Verlustvortrag (in Folgejahr)
                  </td>
                  <td className="py-1.5 text-right text-xs tabular-nums text-gray-500">
                    {formatEuro(ergebnis.verlustVortrag)}
                  </td>
                </tr>
              </>
            )}
            <tr className="border-t border-gray-200">
              <td className="py-1.5 pr-3 text-gray-700">ESt ohne / mit</td>
              <td className="py-1.5 text-right tabular-nums">
                {formatEuro(ergebnis.estOhne)} / {formatEuro(ergebnis.estMit)}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 text-gray-700">Soli ohne / mit</td>
              <td className="py-1.5 text-right tabular-nums">
                {formatEuro(ergebnis.soliOhne)} / {formatEuro(ergebnis.soliMit)}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pr-3 text-gray-700">Kirchensteuer ohne / mit</td>
              <td className="py-1.5 text-right tabular-nums">
                {formatEuro(ergebnis.kirchOhne)} / {formatEuro(ergebnis.kirchMit)}
              </td>
            </tr>
            <Row label="Steuer gesamt ohne" value={ergebnis.steuerOhne} bold />
            <Row label="Steuer gesamt mit" value={ergebnis.steuerMit} bold />
            <Row
              label="Steuerersparnis"
              value={ergebnis.steuerersparnis}
              signed
              bold
            />
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Cashflow (Jahr)
        </h3>
        <table className="w-full text-sm">
          <tbody>
            <Row label="Mieteinnahmen" value={ergebnis.mieteinnahmen} />
            <Row label="− Annuität (Zins + Tilgung)" value={-ergebnis.annuitaetJahr} signed indent />
            <Row label="− Laufende Kosten" value={-ergebnis.laufendeKosten} signed indent />
            <Row
              label="Cashflow vor Steuern"
              value={ergebnis.cashflowVorSteuer}
              signed
              bold
            />
            <Row label="+ Steuerersparnis" value={ergebnis.steuerersparnis} signed indent />
            <Row
              label="Cashflow nach Steuern"
              value={ergebnis.cashflowNachSteuer}
              signed
              bold
            />
            <tr className="border-t border-gray-200">
              <td colSpan={2} className="pt-3 text-xs text-gray-500">
                Hinweis: Tilgung ist kein Aufwand — sie wird in voller Annuität als
                Liquiditätsabfluss berücksichtigt, nicht zusätzlich addiert.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
