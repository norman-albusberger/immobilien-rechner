import { useMemo } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import annotationPlugin, { type AnnotationOptions } from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { berechneAlles } from '../lib/steuer';
import type { Eingaben } from '../types';
import { formatEuro } from '../lib/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

interface Props {
  eingaben: Eingaben;
}

const STEP = 50;
const MAX_MIETE = 3000;

function findBreakEven(
  series: { x: number; y: number }[],
): number | null {
  for (let i = 1; i < series.length; i++) {
    const a = series[i - 1];
    const b = series[i];
    if ((a.y <= 0 && b.y >= 0) || (a.y >= 0 && b.y <= 0)) {
      if (a.y === b.y) return a.x;
      const t = -a.y / (b.y - a.y);
      return a.x + t * (b.x - a.x);
    }
  }
  return null;
}

export function OptimierungsChart({ eingaben }: Props) {
  const { labels, cfVor, cfNach, ersparnis, beVor, beNach, beErsparnis } =
    useMemo(() => {
      const labels: number[] = [];
      const cfVor: { x: number; y: number }[] = [];
      const cfNach: { x: number; y: number }[] = [];
      const ersparnis: { x: number; y: number }[] = [];

      for (let m = 0; m <= MAX_MIETE; m += STEP) {
        const r = berechneAlles(eingaben, m);
        labels.push(m);
        cfVor.push({ x: m, y: r.cashflowVorSteuer });
        cfNach.push({ x: m, y: r.cashflowNachSteuer });
        ersparnis.push({ x: m, y: r.steuerersparnis });
      }

      return {
        labels,
        cfVor,
        cfNach,
        ersparnis,
        beVor: findBreakEven(cfVor),
        beNach: findBreakEven(cfNach),
        beErsparnis: findBreakEven(ersparnis),
      };
    }, [eingaben]);

  const annotations: Record<string, AnnotationOptions> = {};
  if (beVor !== null) {
    annotations.beVor = {
      type: 'line',
      xMin: beVor,
      xMax: beVor,
      borderColor: '#185FA5',
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        display: true,
        content: `CF vor: ${Math.round(beVor)} €`,
        position: 'start',
        backgroundColor: 'rgba(24,95,165,0.85)',
        color: '#fff',
        font: { size: 10 },
        padding: 3,
      },
    };
  }
  if (beNach !== null) {
    annotations.beNach = {
      type: 'line',
      xMin: beNach,
      xMax: beNach,
      borderColor: '#0F6E56',
      borderWidth: 1,
      borderDash: [4, 4],
      label: {
        display: true,
        content: `CF nach: ${Math.round(beNach)} €`,
        position: 'end',
        backgroundColor: 'rgba(15,110,86,0.85)',
        color: '#fff',
        font: { size: 10 },
        padding: 3,
      },
    };
  }
  if (beErsparnis !== null) {
    annotations.beErsparnis = {
      type: 'line',
      xMin: beErsparnis,
      xMax: beErsparnis,
      borderColor: '#D4537E',
      borderWidth: 1,
      borderDash: [2, 2],
      label: {
        display: true,
        content: `V&V = 0: ${Math.round(beErsparnis)} €`,
        position: 'center',
        backgroundColor: 'rgba(212,83,126,0.85)',
        color: '#fff',
        font: { size: 10 },
        padding: 3,
      },
    };
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Cashflow vor Steuern',
        data: cfVor.map((p) => p.y),
        borderColor: '#185FA5',
        backgroundColor: 'rgba(24,95,165,0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
      },
      {
        label: 'Cashflow nach Steuern',
        data: cfNach.map((p) => p.y),
        borderColor: '#0F6E56',
        backgroundColor: 'rgba(15,110,86,0.1)',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        tension: 0,
      },
      {
        label: 'Steuerersparnis',
        data: ersparnis.map((p) => p.y),
        borderColor: '#D4537E',
        backgroundColor: 'rgba(212,83,126,0.1)',
        borderWidth: 2,
        borderDash: [2, 3],
        pointRadius: 0,
        tension: 0,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          title: (items) => `Monatsmiete: ${items[0].label} €`,
          label: (item) =>
            `${item.dataset.label}: ${formatEuro(item.parsed.y ?? 0)}`,
        },
      },
      annotation: { annotations },
    },
    scales: {
      x: {
        title: { display: true, text: 'Monatsmiete (€)' },
        ticks: { maxTicksLimit: 13 },
      },
      y: {
        title: { display: true, text: 'Jahresbetrag (€)' },
        ticks: { callback: (value) => formatEuro(Number(value)) },
      },
    },
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Optimierung: Cashflow vs. Monatsmiete
      </h3>
      <div className="h-[360px]">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}
