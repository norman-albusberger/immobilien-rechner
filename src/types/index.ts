export type Veranlagung = 'einzel' | 'zusammen';
export type Kirchensteuersatz = 0 | 0.08 | 0.09;
export type AfaSatz = 0.02 | 0.03;

export interface Eingaben {
  zvE: number;
  veranlagung: Veranlagung;
  kirchensteuer: Kirchensteuersatz;
  monatsmiete: number;
  kaufpreis: number;
  gebaeudeanteil: number;
  afaSatz: AfaSatz;
  darlehensbetrag: number;
  zinssatz: number;
  monatlicherRate: number;
  hausgeld: number;
  grundsteuer: number;
  verwaltung: number;
  instandhaltung: number;
  sonstigeWK: number;
}

export interface Ergebnis {
  mieteinnahmen: number;
  zinsenJahr: number;
  afaJahr: number;
  laufendeKosten: number;
  werbungskosten: number;
  einkuenfteVV: number;
  zveMit: number;
  zveOhne: number;
  estMit: number;
  estOhne: number;
  soliMit: number;
  soliOhne: number;
  kirchMit: number;
  kirchOhne: number;
  steuerMit: number;
  steuerOhne: number;
  steuerersparnis: number;
  verlustVortrag: number;
  genutzterVerlust: number;
  effektivSatz: number | null;
  grenzsteuersatz: number;
  annuitaetJahr: number;
  zinsenCFAnteil: number;
  tilgungCFAnteil: number;
  rateDecktZinsenNicht: boolean;
  zinsFehlbetrag: number;
  cashflowVorSteuer: number;
  cashflowNachSteuer: number;
}
