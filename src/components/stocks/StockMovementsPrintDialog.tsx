
// src/components/stocks/StockMovementsPrintDialog.tsx

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

// ✅ Composant à imprimer
const PrintableCommande = React.forwardRef<HTMLDivElement, { numero: string; dateLivraison: string }>(
  ({ numero, dateLivraison }, ref) => (
    <div ref={ref} style={{ padding: 24 }}>
      <h2>Bon de commande</h2>
      <p><strong>Numéro :</strong> {numero}</p>
      <p><strong>Date de livraison prévue :</strong> {dateLivraison}</p>
    </div>
  )
);

PrintableCommande.displayName = "PrintableCommande"; // Pour éviter un warning React

// ✅ Composant principal avec bouton imprimer
export const StockMovementsPrintDialog: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: "Stock Movement",
    onAfterPrint: () => console.log("Impression terminée"),
    pageStyle: "@page { size: auto; margin: 10mm; }",
    // For react-to-print v3.0.0+
    content: () => componentRef.current,
  });

  // 🔧 À remplacer par des valeurs dynamiques si besoin
  const numeroCommande = "BC-2025-04-14-366";
  const dateLivraison = "2025-04-14 12:13";

  return (
    <div>
      {/* ✅ Zone à imprimer (peut être visible ou cachée selon ton besoin) */}
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <PrintableCommande
            numero={numeroCommande}
            dateLivraison={dateLivraison}
          />
        </div>
      </div>

      {/* ✅ Bouton imprimable */}
      <button onClick={() => handlePrint()}>🖨️ Imprimer ce bon</button>
    </div>
  );
};
