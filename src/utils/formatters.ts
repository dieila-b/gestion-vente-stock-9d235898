
/**
 * Format a number as currency in GNF
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a date as a short string
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-GN');
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-GN').format(value);
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('fr-GN', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}
