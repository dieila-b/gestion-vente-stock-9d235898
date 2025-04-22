
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePurchaseInvoice } from "@/hooks/purchases/use-purchase-invoice";
import { PurchaseInvoiceItems } from "@/components/purchases/invoices/PurchaseInvoiceItems";

function PurchaseInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { invoice, invoiceItems, isLoading } = usePurchaseInvoice(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Chargement...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Facture non trouvée</h2>
          <p className="text-muted-foreground mt-2">La facture demandée n'existe pas ou a été supprimée.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Facture #{invoice.invoice_number}</h1>
          <div className="space-x-2">
            <Button variant="outline">Imprimer</Button>
            <Button>Payer</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Fournisseur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{invoice.supplier?.name || "Fournisseur inconnu"}</p>
              <p className="text-muted-foreground">{invoice.supplier?.email || ""}</p>
              <p className="text-muted-foreground">{invoice.supplier?.phone || ""}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Détails facture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut:</span>
                  <span>{invoice.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant:</span>
                  <span>{formatGNF(invoice.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bon de commande</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.purchase_order ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Numéro:</span>
                    <span>{invoice.purchase_order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>
                      {invoice.purchase_order.created_at 
                        ? new Date(invoice.purchase_order.created_at).toLocaleDateString() 
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun bon de commande associé</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseInvoiceItems items={invoiceItems} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-1/2 ml-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total:</span>
                <span>{formatGNF(invoice.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes:</span>
                <span>{formatGNF(invoice.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
                <span>Total:</span>
                <span>{formatGNF(invoice.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default PurchaseInvoicePage;
