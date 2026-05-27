const euroFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const euroSignedFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  signDisplay: 'auto',
});

const percentFormatter = new Intl.NumberFormat('de-DE', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const percent0Formatter = new Intl.NumberFormat('de-DE', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatEuro(value: number): string {
  return euroFormatter.format(Math.round(value));
}

export function formatEuroSigned(value: number): string {
  return euroSignedFormatter.format(Math.round(value));
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function formatPercent0(value: number): string {
  return percent0Formatter.format(value);
}
