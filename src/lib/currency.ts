
/**
 * Format a number as GNF currency
 */
export const formatGNFNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format a number with French number formatting (spaces as thousand separators)
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Parse a formatted number string back to a number
 */
export const parseFormattedNumber = (formattedNumber: string): number => {
  // Remove all non-digit characters except decimal separator
  const numeric = formattedNumber.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(numeric) || 0;
};
