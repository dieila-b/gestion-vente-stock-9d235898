
import React from 'react';

interface EmptyInvoiceStateProps {
  isLoading: boolean;
}

export function EmptyInvoiceState({ isLoading }: EmptyInvoiceStateProps) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={10} className="p-4 text-center">
          Chargement...
        </td>
      </tr>
    );
  }
  
  return (
    <tr>
      <td colSpan={10} className="p-4 text-center">
        Aucune facture trouvée
      </td>
    </tr>
  );
}
