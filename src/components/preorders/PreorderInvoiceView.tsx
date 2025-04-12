
import React from 'react';
import { CartState } from "@/types/CartState";
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Printer, Share2, Download } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PreorderInvoiceViewProps {
  cart: CartState;
  client: Client | null;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onAddToCart: (item: any) => void;
  onUpdateNotes: (notes: string) => void;
  onClearClient: () => void;
  onSubmit: () => void;
  onSelectClient: (client: Client) => void;
  onSetDiscount: (discount: number) => void;
  onUpdateDiscount: (id: string, discount: number) => void;
  isLoading: boolean;
  isEditMode: boolean;
  
  // Legacy props for backward compatibility
  showInvoiceDialog?: boolean;
  handleCloseInvoice?: () => void;
  currentPreorder?: any;
  handlePrintInvoice?: (isReceipt?: boolean) => Promise<void>;
}

export function PreorderInvoiceView({
  cart,
  client,
  onRemoveItem,
  onUpdateQuantity,
  onAddToCart,
  onUpdateNotes,
  onClearClient,
  onSubmit,
  onSelectClient,
  onSetDiscount,
  onUpdateDiscount,
  isLoading,
  isEditMode,
  showInvoiceDialog,
  handleCloseInvoice,
  currentPreorder,
  handlePrintInvoice
}: PreorderInvoiceViewProps) {
  // Support for legacy mode
  if (currentPreorder && showInvoiceDialog !== undefined) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Précommande #{currentPreorder.id.substring(0, 8).toUpperCase()}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handlePrintInvoice && handlePrintInvoice()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Information Client</h3>
            <div className="border rounded-md p-4">
              <p className="font-medium">{currentPreorder.client?.company_name || currentPreorder.client?.contact_name || "Client particulier"}</p>
              {currentPreorder.client?.contact_name && <p>{currentPreorder.client.contact_name}</p>}
              {currentPreorder.client?.phone && <p>{currentPreorder.client.phone}</p>}
              {currentPreorder.client?.email && <p>{currentPreorder.client.email}</p>}
              {currentPreorder.client?.address && <p>{currentPreorder.client.address}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Détails de la précommande</h3>
            <div className="border rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date(currentPreorder.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Statut:</span>
                <span className="font-medium">{currentPreorder.status}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Montant total:</span>
                <span className="font-medium">{formatGNF(currentPreorder.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paiement:</span>
                <span className="font-medium">{formatGNF(currentPreorder.paid_amount)} / {formatGNF(currentPreorder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-2">Produits</h3>
        <div className="border rounded-md overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2">Produit</th>
                <th className="text-center px-4 py-2">Prix unitaire</th>
                <th className="text-center px-4 py-2">Quantité</th>
                <th className="text-right px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentPreorder.items.map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.product?.name || `Produit #${item.product_id}`}</td>
                  <td className="text-center px-4 py-3">{formatGNF(item.unit_price)}</td>
                  <td className="text-center px-4 py-3">{item.quantity}</td>
                  <td className="text-right px-4 py-3">{formatGNF(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/50 font-medium">
              <tr>
                <td colSpan={3} className="text-right px-4 py-3">Total:</td>
                <td className="text-right px-4 py-3">{formatGNF(currentPreorder.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {currentPreorder.notes && (
          <>
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            <div className="border rounded-md p-4 mb-6">
              <p>{currentPreorder.notes}</p>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCloseInvoice}>Fermer</Button>
        </div>
      </div>
    );
  }

  // New implementation (stub - to be completed if needed)
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Aperçu de la précommande</h2>
      
      {/* Client information */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Client</h3>
        {client ? (
          <div className="border p-3 rounded-md">
            <p className="font-medium">{client.company_name || client.contact_name}</p>
            {client.contact_name && client.company_name && <p>{client.contact_name}</p>}
            {client.phone && <p>{client.phone}</p>}
            {client.email && <p>{client.email}</p>}
          </div>
        ) : (
          <p className="text-muted-foreground">Aucun client sélectionné</p>
        )}
      </div>
      
      {/* Items */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Articles</h3>
        <ScrollArea className="h-60 border rounded-md">
          <div className="p-3">
            {cart.items && cart.items.length > 0 ? (
              cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b py-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{formatGNF(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatGNF(item.price * item.quantity)}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Aucun article ajouté</p>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Totals */}
      <div className="border rounded-md p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-muted-foreground">Sous-total:</p>
          <p>{formatGNF(cart.subtotal)}</p>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <p className="text-muted-foreground">Remise:</p>
            <p className="text-red-500">-{formatGNF(cart.discount)}</p>
          </div>
        )}
        <div className="flex justify-between items-center font-medium">
          <p>Total:</p>
          <p>{formatGNF(cart.total)}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCloseInvoice}>
          Annuler
        </Button>
        <Button onClick={() => onSubmit()} disabled={isLoading}>
          {isLoading ? "Traitement..." : "Confirmer la précommande"}
        </Button>
      </div>
    </div>
  );
}
