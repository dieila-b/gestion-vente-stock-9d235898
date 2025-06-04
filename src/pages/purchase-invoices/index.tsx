
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseInvoiceHeader } from "@/components/purchases/invoices/PurchaseInvoiceHeader";
import { PurchaseInvoiceList } from "@/components/purchases/invoices/PurchaseInvoiceList";
import { usePurchaseInvoices } from "@/hooks/use-purchase-invoices";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { PurchaseInvoice } from "@/types/purchase-invoice";

export default function PurchaseInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<PurchaseInvoice[]>([]);
  const { 
    invoices: rawInvoices, 
    isLoading,
    error,
    refetch,
    handleView,
    handleDelete 
  } = usePurchaseInvoices();
  
  // Process invoices to ensure they match the PurchaseInvoice type
  useEffect(() => {
    if (!rawInvoices) {
      setFilteredInvoices([]);
      return;
    }

    const processedInvoices = rawInvoices.map(invoice => {
      // Ensure all required fields exist with defaults
      const processedInvoice: PurchaseInvoice = {
        id: invoice.id || '',
        invoice_number: invoice.invoice_number || `FA-${invoice.id?.substring(0, 8) || 'NEW'}`,
        supplier_id: invoice.supplier_id || '',
        total_amount: invoice.total_amount || 0,
        status: invoice.status || 'pending',
        created_at: invoice.created_at || new Date().toISOString(),
        updated_at: invoice.updated_at || new Date().toISOString(),
        tax_amount: invoice.tax_amount || 0,
        payment_status: invoice.payment_status || 'pending',
        due_date: invoice.due_date || new Date().toISOString(),
        paid_amount: invoice.paid_amount || 0,
        remaining_amount: invoice.remaining_amount || invoice.total_amount || 0,
        discount: invoice.discount || 0,
        notes: invoice.notes || '',
        shipping_cost: invoice.shipping_cost || 0,
        supplier: invoice.supplier || { name: 'Fournisseur non défini', phone: '', email: '' },
        purchase_order: invoice.purchase_order || { id: '', order_number: '' },
        delivery_note: invoice.delivery_note || { id: '', delivery_number: '' }
      };
      
      return processedInvoice;
    });
    
    // Filter processed invoices based on search query
    const filtered = processedInvoices.filter(invoice => 
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredInvoices(filtered);
  }, [rawInvoices, searchQuery]);

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">
              Impossible de charger les factures d'achat: {error.message}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <PurchaseInvoiceHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <PurchaseInvoiceList 
              invoices={filteredInvoices}
              isLoading={isLoading}
              onView={handleView}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <p><strong>Debug:</strong> {filteredInvoices.length} facture(s) trouvée(s)</p>
            <p><strong>Requête en cours:</strong> {isLoading ? 'Oui' : 'Non'}</p>
            <p><strong>Erreur:</strong> {error ? error.message : 'Aucune'}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
