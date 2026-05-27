import type { Eingaben, Ergebnis, Veranlagung } from '../types';

const SOLI_FREIGRENZE_EINZEL = 18130;
const SOLI_FREIGRENZE_ZUSAMMEN = 36260;
const SOLI_MILDERUNGS_SATZ = 0.119;
const SOLI_VOLL_SATZ = 0.055;

export function berechneESt2024(zvE: number): number {
  const z = Math.floor(Math.max(0, zvE));
  if (z <= 11604) return 0;
  if (z <= 17005) {
    const y = (z - 11604) / 10000;
    return Math.floor((922.98 * y + 1400) * y);
  }
  if (z <= 66760) {
    const w = (z - 17005) / 10000;
    return Math.floor((181.19 * w + 2397) * w + 1025.38);
  }
  if (z <= 277825) {
    return Math.floor(0.42 * z - 10602.13);
  }
  return Math.floor(0.45 * z - 18936.88);
}

export function berechneESt2024Tarif(zvE: number, veranlagung: Veranlagung): number {
  if (veranlagung === 'zusammen') {
    return 2 * berechneESt2024(zvE / 2);
  }
  return berechneESt2024(zvE);
}

export function berechneSoli(est: number, veranlagung: Veranlagung): number {
  const freigrenze =
    veranlagung === 'zusammen' ? SOLI_FREIGRENZE_ZUSAMMEN : SOLI_FREIGRENZE_EINZEL;
  if (est <= freigrenze) return 0;
  const milderung = SOLI_MILDERUNGS_SATZ * (est - freigrenze);
  const voll = SOLI_VOLL_SATZ * est;
  return Math.min(milderung, voll);
}

export function berechneGrenzsteuersatz(
  zvE: number,
  veranlagung: Veranlagung,
  kist: number,
): number {
  const dx = 100;
  const est1 = berechneESt2024Tarif(zvE, veranlagung);
  const est2 = berechneESt2024Tarif(zvE + dx, veranlagung);
  const t1 = est1 + berechneSoli(est1, veranlagung) + est1 * kist;
  const t2 = est2 + berechneSoli(est2, veranlagung) + est2 * kist;
  return (t2 - t1) / dx;
}

export function berechneAlles(eingaben: Eingaben, monatsmieteOverride?: number): Ergebnis {
  const monatsmiete = monatsmieteOverride ?? eingaben.monatsmiete;
  const mieteinnahmen = monatsmiete * 12;

  const zinsenJahr = eingaben.darlehensbetrag * eingaben.zinssatz;
  const afaJahr = eingaben.kaufpreis * eingaben.gebaeudeanteil * eingaben.afaSatz;
  const laufendeKosten =
    eingaben.hausgeld +
    eingaben.grundsteuer +
    eingaben.verwaltung +
    eingaben.instandhaltung +
    eingaben.sonstigeWK;
  const werbungskosten = zinsenJahr + afaJahr + laufendeKosten;
  const einkuenfteVV = mieteinnahmen - werbungskosten;

  const zveMitRaw = eingaben.zvE + einkuenfteVV;
  const zveMit = Math.max(0, zveMitRaw);
  const zveOhne = Math.max(0, eingaben.zvE);

  const verlustVortrag = einkuenfteVV < 0 ? Math.max(0, -zveMitRaw) : 0;
  const genutzterVerlust =
    einkuenfteVV < 0 ? Math.min(Math.abs(einkuenfteVV), eingaben.zvE) : 0;

  const estMit = berechneESt2024Tarif(zveMit, eingaben.veranlagung);
  const estOhne = berechneESt2024Tarif(zveOhne, eingaben.veranlagung);

  const soliMit = berechneSoli(estMit, eingaben.veranlagung);
  const soliOhne = berechneSoli(estOhne, eingaben.veranlagung);

  const kirchMit = estMit * eingaben.kirchensteuer;
  const kirchOhne = estOhne * eingaben.kirchensteuer;

  const steuerMit = estMit + soliMit + kirchMit;
  const steuerOhne = estOhne + soliOhne + kirchOhne;

  const steuerersparnis = steuerOhne - steuerMit;

  const effektivSatz =
    einkuenfteVV !== 0 ? steuerersparnis / -einkuenfteVV : null;
  const grenzsteuersatz = berechneGrenzsteuersatz(
    zveOhne,
    eingaben.veranlagung,
    eingaben.kirchensteuer,
  );

  const annuitaetJahr = eingaben.monatlicherRate * 12;
  const zinsenCFAnteil = Math.min(zinsenJahr, annuitaetJahr);
  const tilgungCFAnteil = Math.max(0, annuitaetJahr - zinsenJahr);
  const rateDecktZinsenNicht = annuitaetJahr < zinsenJahr;
  const zinsFehlbetrag = Math.max(0, zinsenJahr - annuitaetJahr);

  const cashflowVorSteuer = mieteinnahmen - annuitaetJahr - laufendeKosten;
  const cashflowNachSteuer = cashflowVorSteuer + steuerersparnis;

  return {
    mieteinnahmen,
    zinsenJahr,
    afaJahr,
    laufendeKosten,
    werbungskosten,
    einkuenfteVV,
    zveMit,
    zveOhne,
    estMit,
    estOhne,
    soliMit,
    soliOhne,
    kirchMit,
    kirchOhne,
    steuerMit,
    steuerOhne,
    steuerersparnis,
    verlustVortrag,
    genutzterVerlust,
    effektivSatz,
    grenzsteuersatz,
    annuitaetJahr,
    zinsenCFAnteil,
    tilgungCFAnteil,
    rateDecktZinsenNicht,
    zinsFehlbetrag,
    cashflowVorSteuer,
    cashflowNachSteuer,
  };
}
