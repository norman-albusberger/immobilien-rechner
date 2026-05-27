# SUSA – Immobilienrechner

Standalone-Desktop-App (macOS / Windows) zur steuerlichen Bewertung vermieteter Immobilien.
Berechnet aus Eingaben wie Kaufpreis, Finanzierung, Miete und laufenden Kosten:

- Einkünfte aus Vermietung & Verpachtung (§ 21 EStG)
- Einkommensteuer 2024 nach § 32a EStG (Splitting für Zusammenveranlagung)
- Solidaritätszuschlag inkl. Milderungszone
- Kirchensteuer (0 / 8 / 9 %)
- Steuerersparnis und Grenzsteuersatz
- Cashflow vor und nach Steuern (Annuitäten-basiert)
- Verlustvortrag in Folgejahre, falls Verlust > zvE

Eine interaktive Chart-Komponente zeigt die Sensitivität gegenüber der Monatsmiete (0–3.000 €) und markiert die drei Break-even-Punkte (Cashflow vor Steuern, nach Steuern, V&V = 0).

---

## Tech-Stack

| Schicht           | Technologie                              |
|-------------------|------------------------------------------|
| UI                | React 19 + TypeScript                    |
| Build / Dev-Server| Vite 8                                   |
| Styling           | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Charts            | Chart.js 4 + react-chartjs-2 + `chartjs-plugin-annotation` |
| Tests             | Vitest                                   |
| Desktop-Bundling  | Tauri 2 (Rust-Backend, System-WebView)   |

Tauri statt Electron, weil das Installer-Bundle dadurch ca. 3 MB groß ist statt ~150 MB.

---

## Projektstruktur

```
immobilien-rechner/
├── src/
│   ├── lib/
│   │   ├── steuer.ts             # Reine Berechnungsfunktionen (keine UI)
│   │   ├── format.ts             # de-DE €/%-Formatter
│   │   └── __tests__/
│   │       └── steuer.test.ts    # 27 Unit-Tests gegen amtliche Tabellenwerte
│   ├── components/
│   │   ├── InputPanel.tsx        # Eingabefelder (linke Spalte)
│   │   ├── MetricCards.tsx       # Vier Kennzahl-Kacheln oben
│   │   ├── DetailTable.tsx       # Steuerliche Berechnung + Cashflow
│   │   ├── RateInfo.tsx          # Zins/Tilgungs-Anteil + rote Warnbox
│   │   └── OptimierungsChart.tsx # Chart Miete vs. Cashflow
│   ├── types/
│   │   └── index.ts              # Eingaben / Ergebnis Interfaces
│   ├── App.tsx                   # State + Layout
│   ├── main.tsx
│   └── index.css                 # Tailwind-Import + Reset
├── src-tauri/                    # Rust-/Tauri-Backend
│   ├── src/                      # main.rs, lib.rs (Standard-Tauri)
│   ├── Cargo.toml
│   ├── tauri.conf.json           # App-Name, Window, Bundle-Settings
│   └── icons/
├── index.html
├── package.json
└── vite.config.ts
```

Die gesamte Steuerlogik liegt in [`src/lib/steuer.ts`](src/lib/steuer.ts) – pure Funktionen, keine React-Abhängigkeit. Die UI ruft ausschließlich `berechneAlles(eingaben)` auf.

---

## Setup

Einmalig:

```bash
npm install                  # JS-Abhängigkeiten
rustup install stable        # Rust (falls noch nicht vorhanden – nur für Desktop-Build nötig)
```

---

## Entwicklung

### Web-Modus (nur Browser, schneller HMR)
```bash
npm run dev                  # http://localhost:5173
```

### Desktop-Modus (Tauri-Fenster mit HMR)
```bash
npm run tauri:dev            # öffnet ein natives Fenster, lädt von Vite-Dev-Server
```

Beide nutzen denselben React-Code. Im Desktop-Modus zeigt die Title-Bar `SUSA - Immobilienrechner`.

---

## Tests

Die Steuerlogik ist gegen amtliche Tabellenwerte (Grundfreibetrag, Progressionszone I + II, Spitzensteuersatz 42 %, Reichensteuer 45 %) sowie gegen die beiden bekannten Bug-Fixes (Annuitäts-Cashflow, Verlustvortrag-Clamp auf 0) abgesichert.

```bash
npm test                     # Single-Run: 27/27 Tests
npm run test:watch           # Watch-Modus während Entwicklung
```

---

## Produktions-Build

### Web-Bundle (ohne Desktop-Hülle)
```bash
npm run build                # erzeugt dist/
npm run preview              # zur lokalen Vorschau
```

### macOS-Desktop-App
```bash
npm run tauri:build
```
Ergebnis (für die aktuelle Architektur):
- `src-tauri/target/release/bundle/macos/SUSA Immobilienrechner.app`
- `src-tauri/target/release/bundle/dmg/SUSA Immobilienrechner_<version>_<arch>.dmg`

Auf Apple Silicon entsteht ein `aarch64`-Bundle. Für Intel-Macs zusätzlich:
```bash
rustup target add x86_64-apple-darwin
npm run tauri:build -- --target x86_64-apple-darwin
```
Universal-Binary (Intel + Apple Silicon in einer Datei):
```bash
rustup target add x86_64-apple-darwin aarch64-apple-darwin
npm run tauri:build -- --target universal-apple-darwin
```

Da das Bundle nicht signiert ist, zeigt macOS beim ersten Start eine Gatekeeper-Warnung – Rechtsklick → „Öffnen" akzeptiert die App dauerhaft.

### Windows-Desktop-App

Tauri unterstützt **kein Cross-Compile von macOS zu Windows**. Es gibt drei Wege:

1. **Auf einem Windows-Rechner / Windows-VM**
   - [Rust](https://rustup.rs/) installieren
   - [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (für `link.exe`)
   - [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (auf Windows 11 vorinstalliert)
   - Dann:
     ```bash
     npm install
     npm run tauri:build
     ```
   - Ergebnis: `.msi` und `.exe`-Installer unter `src-tauri/target/release/bundle/`

2. **GitHub Actions** (empfohlen für Releases). Die offizielle [`tauri-apps/tauri-action`](https://github.com/tauri-apps/tauri-action) baut bei jedem Tag-Push parallel macOS, Windows und Linux und hängt die Artefakte ans Release.

3. **Parallels / VMware Windows-VM** auf dem Mac – funktional identisch zu (1).

---

## Code-Signing (optional, derzeit aus)

Damit Nutzer ohne Sicherheits-Warnung starten können, müssten die Bundles signiert werden:

- **macOS:** Apple Developer Account (99 €/Jahr) + Notarisierung (`xcrun notarytool`)
- **Windows:** Code-Signing-Zertifikat (~200–400 €/Jahr) + `signtool.exe`

Die Zertifikat-Pfade lassen sich später in [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json) unter `bundle.macOS.signingIdentity` bzw. `bundle.windows.certificateThumbprint` eintragen.

---

## Steuerliche Grundlagen

Die Berechnungen basieren auf den 2024 gültigen Werten:

| Größe                      | Wert (Einzel / Zusammen)        |
|----------------------------|---------------------------------|
| Grundfreibetrag            | 11.604 € / 23.208 €             |
| Spitzensteuersatz 42 % ab  | 66.760 € / 133.520 €            |
| Reichensteuer 45 % ab      | 277.825 € / 555.650 €           |
| Soli-Freigrenze (ESt)      | 18.130 € / 36.260 €             |
| Soli-Milderungszone-Satz   | 11,9 % auf ESt-Überschuss       |
| Soli-Vollerhebung          | 5,5 % der ESt                   |

Beträge werden gemäß § 32a EStG vor dem Tarif auf volle Euro abgerundet (`Math.floor`).

### Bewusst implementierte Korrekturen gegenüber einer naiven Rechnung

1. **Annuität als Ganzes im Cashflow.** Tilgung ist kein Aufwand und wird nicht zusätzlich abgezogen. `cashflowVorSteuer = mieteinnahmen − annuität − laufende Kosten`.
2. **Verlustvortrag clampt zvE auf 0.** Übersteigt der V&V-Verlust das übrige zvE, wird `zveMit = 0` gesetzt und der Rest als `verlustVortrag` für Folgejahre ausgewiesen – nicht (wie häufig fälschlich) als negatives zvE weitergerechnet.
3. **Zinsen werden steuerlich immer voll angesetzt**, auch wenn die monatliche Rate die Jahreszinsen nicht deckt. In diesem Fall zeigt die UI eine rote Warnung mit dem Zins-Fehlbetrag, der die Restschuld wachsen lässt.
