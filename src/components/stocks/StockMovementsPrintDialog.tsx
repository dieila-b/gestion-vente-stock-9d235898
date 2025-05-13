
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { StockMovement } from "@/hooks/stocks/useStockMovementTypes";

interface PrintableCommandeProps {
  numero: string;
  dateLivraison: string;
}

interface StockMovementsPrintDialogProps {
  movements?: StockMovement[];
  type?: 'in' | 'out';
}

const PrintableCommande = React.forwardRef<HTMLDivElement, PrintableCommandeProps>(
  ({ numero, dateLivraison }, ref) => (
    <div ref={ref} style={{ padding: 24 }}>
      <h2>Bon de commande</h2>
      <p><strong>Numéro :</strong> {numero}</p>
      <p><strong>Date de livraison prévue :</strong> {dateLivraison}</p>
    </div>
  )
);

export const StockMovementsPrintDialog: React.FC<StockMovementsPrintDialogProps> = ({ movements = [], type = 'in' }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: "Bon_de_Commande",
    onAfterPrint: () => console.log("Printing completed"),
    // The content property is a function that returns the ref containing the content to print
    content: () => componentRef.current,
  });

  const numeroCommande = "BC-2025-04-14-366";
  const dateLivraison = "2025-04-14 12:13";

  return (
    <div>
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <PrintableCommande
            numero={numeroCommande}
            dateLivraison={dateLivraison}
          />
        </div>
      </div>

      <button onClick={() => handlePrint()}>🖨️ Imprimer ce bon</button>
    </div>
  );
};

// Export it as the default as well to maintain backward compatibility
export default StockMovementsPrintDialog;
