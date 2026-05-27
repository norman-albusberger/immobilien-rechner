import { describe, expect, it } from 'vitest';
import {
  berechneAlles,
  berechneESt2024,
  berechneESt2024Tarif,
  berechneGrenzsteuersatz,
  berechneSoli,
} from '../steuer';
import type { Eingaben } from '../../types';

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

describe('berechneESt2024 (§ 32a EStG 2024)', () => {
  it('returns 0 at and below the Grundfreibetrag', () => {
    expect(berechneESt2024(0)).toBe(0);
    expect(berechneESt2024(11604)).toBe(0);
  });

  it('matches official table values in zone 2 (progressionszone I)', () => {
    // zvE 15.000 → ca. 776 €
    // y = (15000-11604)/10000 = 0.3396
    // (922.98*0.3396 + 1400)*0.3396 = (313.448 + 1400)*0.3396 = 581.99
    expect(berechneESt2024(15000)).toBe(581);
  });

  it('matches official table values in zone 3 (progressionszone II)', () => {
    // zvE 30000 → 4446 €
    expect(berechneESt2024(30000)).toBe(4446);
    // zvE 55000 → 12748 €
    expect(berechneESt2024(55000)).toBe(12748);
  });

  it('matches the proportional zone (Spitzensteuersatz 42%)', () => {
    // zvE 70000: 0.42 * 70000 - 10602.13 = 18797.87 → 18797
    expect(berechneESt2024(70000)).toBe(18797);
  });

  it('matches the Reichensteuer zone (45%)', () => {
    // zvE 300000: 0.45 * 300000 - 18936.88 = 116063.12 → 116063
    expect(berechneESt2024(300000)).toBe(116063);
  });

  it('uses splitting for Zusammenveranlagung', () => {
    // 2 * ESt(zvE/2)
    expect(berechneESt2024Tarif(110000, 'zusammen')).toBe(
      2 * berechneESt2024(55000),
    );
  });
});

describe('berechneSoli (2024)', () => {
  it('is 0 below the Freigrenze (Einzel)', () => {
    expect(berechneSoli(18130, 'einzel')).toBe(0);
    expect(berechneSoli(10000, 'einzel')).toBe(0);
  });

  it('uses the milderungszone above the Freigrenze (Einzel)', () => {
    // ESt = 20000, Freigrenze 18130:
    // milderung = 0.119 * (20000 - 18130) = 0.119 * 1870 = 222.53
    // voll = 0.055 * 20000 = 1100
    // → min(222.53, 1100) = 222.53
    expect(berechneSoli(20000, 'einzel')).toBeCloseTo(222.53, 2);
  });

  it('caps at 5.5% for high incomes (Einzel)', () => {
    // ESt = 100000:
    // milderung = 0.119 * (100000 - 18130) = 9742.53
    // voll = 0.055 * 100000 = 5500
    // → 5500
    expect(berechneSoli(100000, 'einzel')).toBe(5500);
  });

  it('uses doubled Freigrenze for Zusammenveranlagung', () => {
    expect(berechneSoli(36260, 'zusammen')).toBe(0);
    expect(berechneSoli(20000, 'zusammen')).toBe(0);
  });
});

describe('berechneGrenzsteuersatz', () => {
  it('is 0 inside the Grundfreibetrag', () => {
    expect(berechneGrenzsteuersatz(5000, 'einzel', 0)).toBe(0);
  });

  it('returns the marginal rate in the proportional zone below the Soli-Freigrenze', () => {
    // Bei 67000 Einzel: ESt ≈ 17.537 < 18.130 Soli-Freigrenze
    // → reiner Spitzensteuersatz 42%, kein Soli, keine Kirche
    expect(berechneGrenzsteuersatz(67000, 'einzel', 0)).toBeCloseTo(0.42, 2);
  });

  it('adds the milderungszone-Soli on top in the transition band', () => {
    // Bei 80k Einzel: ESt ≈ 33.598, in Soli-Milderungszone
    // → marginaler Soli = 11,9 % von 42 % = 4,998 %; gesamt ≈ 46,998 %
    expect(berechneGrenzsteuersatz(80000, 'einzel', 0)).toBeCloseTo(
      0.42 + 0.42 * 0.119,
      3,
    );
  });

  it('includes solidarity surcharge in the marginal rate at high incomes', () => {
    // Bei 200k Einzel: 42% + Soli (volle 5.5% von ESt → +0.0231)
    const r = berechneGrenzsteuersatz(200000, 'einzel', 0);
    expect(r).toBeGreaterThan(0.42);
    expect(r).toBeCloseTo(0.42 * 1.055, 3);
  });
});

describe('berechneAlles — Default-Szenario (55k zvE, 1000 € Miete)', () => {
  const r = berechneAlles(defaultEingaben);

  it('computes Mieteinnahmen and Werbungskosten correctly', () => {
    expect(r.mieteinnahmen).toBe(12000);
    expect(r.zinsenJahr).toBe(9500); // 250.000 * 0.038
    expect(r.afaJahr).toBe(5120); // 320.000 * 0.8 * 0.02
    expect(r.laufendeKosten).toBe(4400); // 2400+600+400+800+200
    expect(r.werbungskosten).toBe(19020);
  });

  it('computes Einkünfte V&V as a loss', () => {
    expect(r.einkuenfteVV).toBe(-7020);
  });

  it('reduces zvE by the V&V loss without flipping it negative', () => {
    expect(r.zveMit).toBe(47980);
    expect(r.zveOhne).toBe(55000);
  });

  it('computes ESt for both scenarios', () => {
    expect(r.estOhne).toBe(berechneESt2024(55000));
    expect(r.estMit).toBe(berechneESt2024(47980));
  });

  it('computes Steuerersparnis as a positive amount', () => {
    expect(r.steuerersparnis).toBeGreaterThan(0);
    expect(r.steuerersparnis).toBe(r.steuerOhne - r.steuerMit);
  });

  it('Bug 1 fix: Cashflow uses the full annuity, never tilgung separately', () => {
    // annuitaetJahr = 1400 * 12 = 16800
    expect(r.annuitaetJahr).toBe(16800);
    // CF_vor = 12000 - 16800 - 4400 = -9200
    expect(r.cashflowVorSteuer).toBe(-9200);
    expect(r.cashflowNachSteuer).toBe(-9200 + r.steuerersparnis);
  });

  it('splits annuity into Zins and Tilgung when rate >= Zinsen', () => {
    expect(r.zinsenCFAnteil).toBe(9500);
    expect(r.tilgungCFAnteil).toBe(7300);
    expect(r.rateDecktZinsenNicht).toBe(false);
    expect(r.zinsFehlbetrag).toBe(0);
  });
});

describe('berechneAlles — Bug 2 fix: Verlustvortrag clamps zvE to 0', () => {
  it('never returns a negative zveMit, even if VV-loss exceeds zvE', () => {
    const eingaben: Eingaben = {
      ...defaultEingaben,
      zvE: 5000,
      monatsmiete: 0,
      darlehensbetrag: 500000,
      zinssatz: 0.05,
    };
    const r = berechneAlles(eingaben);

    // einkuenfteVV ist stark negativ
    expect(r.einkuenfteVV).toBeLessThan(-r.zveOhne);
    // zveMit ist auf 0 geclampt
    expect(r.zveMit).toBe(0);
    // Verlustvortrag ist der nicht-genutzte Verlustanteil
    expect(r.verlustVortrag).toBeGreaterThan(0);
    // Genutzter Verlust ist max. das ursprüngliche zvE
    expect(r.genutzterVerlust).toBe(5000);
    // Verlust + Genutzter Verlust ≈ |einkuenfteVV|
    expect(r.verlustVortrag + r.genutzterVerlust).toBeCloseTo(
      Math.abs(r.einkuenfteVV),
      6,
    );
  });

  it('returns 0 Verlustvortrag when V&V is positive', () => {
    const eingaben: Eingaben = {
      ...defaultEingaben,
      monatsmiete: 3000, // 36k Miete schlägt Werbungskosten
    };
    const r = berechneAlles(eingaben);
    expect(r.einkuenfteVV).toBeGreaterThan(0);
    expect(r.verlustVortrag).toBe(0);
    expect(r.genutzterVerlust).toBe(0);
  });
});

describe('berechneAlles — Rate-deckt-Zinsen-nicht Warnung', () => {
  it('flags when annuity < Zinsen', () => {
    const eingaben: Eingaben = {
      ...defaultEingaben,
      darlehensbetrag: 400000,
      zinssatz: 0.05, // 20000 € Zinsen/Jahr
      monatlicherRate: 1500, // 18000 € Annuität
    };
    const r = berechneAlles(eingaben);
    expect(r.zinsenJahr).toBe(20000);
    expect(r.annuitaetJahr).toBe(18000);
    expect(r.rateDecktZinsenNicht).toBe(true);
    expect(r.zinsFehlbetrag).toBe(2000);
    // Cashflow-Anteile clamp: Zinsenanteil = annuität, Tilgungsanteil = 0
    expect(r.zinsenCFAnteil).toBe(18000);
    expect(r.tilgungCFAnteil).toBe(0);
  });
});

describe('berechneAlles — Override monatsmiete', () => {
  it('uses the override instead of eingaben.monatsmiete', () => {
    const r1 = berechneAlles(defaultEingaben, 2000);
    expect(r1.mieteinnahmen).toBe(24000);
    // ohne override: 12000
    const r2 = berechneAlles(defaultEingaben);
    expect(r2.mieteinnahmen).toBe(12000);
  });
});

describe('berechneAlles — effektivSatz', () => {
  it('is null when einkuenfteVV is exactly 0', () => {
    // Konstrukt: Werbungskosten = Mieteinnahmen
    // Mieteinnahmen = 12 * monatsmiete
    // Werbungskosten = zinsen + afa + lk
    // Setze keine Zinsen, keine AfA, lk=12000, monatsmiete=1000
    const eingaben: Eingaben = {
      ...defaultEingaben,
      darlehensbetrag: 0,
      zinssatz: 0,
      kaufpreis: 0,
      monatsmiete: 1000,
      hausgeld: 12000,
      grundsteuer: 0,
      verwaltung: 0,
      instandhaltung: 0,
      sonstigeWK: 0,
    };
    const r = berechneAlles(eingaben);
    expect(r.einkuenfteVV).toBe(0);
    expect(r.effektivSatz).toBeNull();
  });

  it('expresses tax savings per loss-euro for loss scenarios', () => {
    const r = berechneAlles(defaultEingaben);
    // effektivSatz = steuerersparnis / -einkuenfteVV
    expect(r.effektivSatz).not.toBeNull();
    expect(r.effektivSatz!).toBeCloseTo(
      r.steuerersparnis / -r.einkuenfteVV,
      6,
    );
  });
});
