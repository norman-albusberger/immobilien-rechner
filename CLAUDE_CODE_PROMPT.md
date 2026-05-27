# Immobilien-Steuerrechner — Aufgabe für Claude Code

## Ziel

Überführe den bestehenden HTML/JS-Steuerrechner in ein sauberes React + Vite Projekt mit TypeScript.

---

## Gewünschte Projektstruktur

```
immobilien-rechner/
├── src/
│   ├── lib/
│   │   └── steuer.ts          # Alle Berechnungsfunktionen (reine Funktionen, keine UI)
│   ├── components/
│   │   ├── InputPanel.tsx     # Alle Eingabefelder (linke Spalte)
│   │   ├── MetricCards.tsx    # Die 4 Kennzahl-Kacheln
│   │   ├── DetailTable.tsx    # Steuerliche Berechnung + Cashflow-Tabelle
│   │   ├── OptimierungsChart.tsx  # Chart.js Diagramm (Miete vs. Cashflow)
│   │   └── RateInfo.tsx       # Zins/Tilgungs-Aufschlüsselung + Warnbox
│   ├── types/
│   │   └── index.ts           # Alle TypeScript-Interfaces und -Types
│   ├── App.tsx                # Hauptkomponente, State-Management
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

---

## Schritt 1 — Typen definieren (src/types/index.ts)

```typescript
export interface Eingaben {
  zvE: number;                  // Zu versteuerndes Einkommen ohne Immobilie
  veranlagung: 'einzel' | 'zusammen';
  kirchensteuer: 0 | 0.08 | 0.09;
  monatsmiete: number;
  kaufpreis: number;
  gebaeudeanteil: number;       // 0–1
  afaSatz: 0.02 | 0.03;
  darlehensbetrag: number;
  zinssatz: number;             // 0–1
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
```

---

## Schritt 2 — Berechnungslogik (src/lib/steuer.ts)

Extrahiere folgende reine Funktionen (keine React-Abhängigkeiten):

- `berechneESt2024(zvE: number): number` — ESt nach § 32a EStG 2024
- `berechneSoli(est: number, veranlagung: string): number` — inkl. Milderungszone
- `berechneGrenzsteuersatz(zvE: number, veranlagung: string, kist: number): number`
- `berechneAlles(eingaben: Eingaben, monatsmiete?: number): Ergebnis` — Hauptfunktion

**Wichtige Berechnungsregeln (exakt aus dem bestehenden Code übernehmen):**

```
// Steuerliche Werbungskosten:
zinsenJahr = darlehensbetrag * zinssatz          // voller Zinsanfall, auch wenn Rate < Zinsen
afaJahr = kaufpreis * gebaeudeanteil * afaSatz
werbungskosten = zinsenJahr + afaJahr + laufendeKosten

// Verlustvortrag (Bug 2 Fix):
zveMitRaw = zvE + einkuenfteVV
zveMit = max(0, zveMitRaw)
verlustVortrag = einkuenfteVV < 0 ? max(0, -zveMitRaw) : 0
genutzterVerlust = einkuenfteVV < 0 ? min(abs(einkuenfteVV), zvE) : 0

// Cashflow (Bug 1 Fix): Annuität als Ganzes, nie Tilgung separat addieren
annuitaetJahr = monatlicherRate * 12
cashflowVorSteuer = mieteinnahmen - annuitaetJahr - laufendeKosten
cashflowNachSteuer = cashflowVorSteuer + steuerersparnis

// Rate vs. Zinsen:
rateDecktZinsenNicht = annuitaetJahr < zinsenJahr
zinsFehlbetrag = max(0, zinsenJahr - annuitaetJahr)
zinsenCFAnteil = min(zinsenJahr, annuitaetJahr)
tilgungCFAnteil = max(0, annuitaetJahr - zinsenJahr)
```

---

## Schritt 3 — App.tsx State-Management

```typescript
// Standardwerte
const defaultEingaben: Eingaben = {
  zvE: 55000,
  veranlagung: 'einzel',
  kirchensteuer: 0,
  monatsmiete: 1000,
  kaufpreis: 320000,
  gebaeudeanteil: 0.80,
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

// State + Berechnung
const [eingaben, setEingaben] = useState<Eingaben>(defaultEingaben);
const ergebnis = useMemo(() => berechneAlles(eingaben), [eingaben]);
```

---

## Schritt 4 — Chart (OptimierungsChart.tsx)

Verwende `react-chartjs-2` + `chart.js`. Das Diagramm zeigt:
- X-Achse: Monatsmiete 0–3.000 €
- Y-Achse: Jahresbetrag in €
- 3 Linien: Cashflow vor Steuer (blau), Cashflow nach Steuer (grün gestrichelt), Steuerersparnis (rosa gepunktet)
- Break-even-Linien als vertikale Annotations (chartjs-plugin-annotation)

```bash
npm install react-chartjs-2 chart.js chartjs-plugin-annotation
```

---

## Schritt 5 — Styling

Verwende **Tailwind CSS** für das Styling:

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Layout: 2-Spalten-Grid (linke Spalte Inputs 280px, rechte Spalte Results flex-1).
Farbschema: neutral-weiß, Akzentfarben blau (#185FA5), grün (#0F6E56), rosa (#D4537E).
Warnboxen in rot (border-red-300, bg-red-50, text-red-700).

---

## Schritt 6 — Zusatzfeatures (optional, wenn Zeit bleibt)

1. **PDF-Export:** `npm install jspdf html2canvas` — Button der die Ergebnisse als PDF speichert
2. **Mehrjahresprojektion:** Tabelle die zeigt wie sich Zinslast, V&V-Ergebnis und Cashflow über 10 Jahre entwickeln (mit sinkendem Zinsanteil bei konstanter Annuität)
3. **Unit-Tests:** `npm install -D vitest` — Tests für alle Funktionen in `steuer.ts` mit den verifizierten Szenarien aus der Analyse

---

## Hinweise zur Codequalität

- Alle Zahlen die angezeigt werden durch `Math.round()` oder `.toFixed()` — keine Floating-Point-Artefakte
- Negative Beträge mit Minuszeichen vor der Währung: `–1.234 €` nicht `1.234– €`
- Trennzeichen deutsch: `.toLocaleString('de-DE')` für alle Anzeigen
- ESt-Formel exakt aus dem verifizierten Code übernehmen — nicht neu implementieren
- Verlustvortrag und Rate-Warnung sind bekannte Bugs die bereits behoben sind — nicht rückgängig machen

---

## Setup-Befehle

```bash
npm create vite@latest immobilien-rechner -- --template react-ts
cd immobilien-rechner
npm install
npm install react-chartjs-2 chart.js chartjs-plugin-annotation
npm install -D tailwindcss @tailwindcss/vite
npm run dev
```
