import { useMemo, useState } from 'react';
import { InputPanel } from './components/InputPanel';
import { MetricCards } from './components/MetricCards';
import { DetailTable } from './components/DetailTable';
import { RateInfo } from './components/RateInfo';
import { OptimierungsChart } from './components/OptimierungsChart';
import { berechneAlles } from './lib/steuer';
import type { Eingaben } from './types';

const defaultEingaben: Eingaben = {
  zvE: 55000,
  veranlagung: 'einzel',
  kirchensteuer: 0,
  monatsmiete: 1000,
  kaufpreis: 320000,
  gebaeudeanteil: 0.8,
  afaSatz: 0.02,
  darlehensbetrag: 250000,
  zinssatz: 0.038,
  monatlicherRate: 1400,
  hausgeld: 2400,
  grundsteuer: 600,
  verwaltung: 400,
  instandhaltung: 800,
  sonstigeWK: 200,
};

function App() {
  const [eingaben, setEingaben] = useState<Eingaben>(defaultEingaben);
  const ergebnis = useMemo(() => berechneAlles(eingaben), [eingaben]);

  return (
    <div className="min-h-screen w-full bg-[#f5f7fa] p-4 lg:p-6">
      <header className="mx-auto mb-6 max-w-[1400px]">
        <h1 className="text-2xl font-semibold text-gray-800">
          SUSA - Immobilienrechner
        </h1>
        <p className="text-sm text-gray-500">
          ESt 2024 (§ 32a EStG) · Soli inkl. Milderungszone · Verlustvortrag und
          Annuitäten-Cashflow korrekt abgebildet
        </p>
      </header>

      <main className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:flex-row">
        <InputPanel eingaben={eingaben} onChange={setEingaben} />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <MetricCards ergebnis={ergebnis} />
          <RateInfo ergebnis={ergebnis} />
          <DetailTable ergebnis={ergebnis} />
          <OptimierungsChart eingaben={eingaben} />
        </div>
      </main>
    </div>
  );
}

export default App;
