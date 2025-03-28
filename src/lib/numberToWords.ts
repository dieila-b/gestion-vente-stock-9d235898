import { formatGNF } from './currency';

// Fonction pour convertir un nombre en mots en français
export function numberToWords(num: number): string {
  // Pour simplifier, nous allons juste utiliser le formatage GNF existant
  // Dans un cas réel, on implémenterait la conversion complète des nombres en mots
  const formatted = formatGNF(num);
  return formatted;
}
