
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseInvoiceHeader } from "@/components/purchases/invoices/PurchaseInvoiceHeader";
import { PurchaseInvoiceList } from "@/components/purchases/invoices/PurchaseInvoiceList";
import { usePurchaseInvoices } from "@/hooks/use-purchase-invoices";
import { isSelectQueryError } from "@/utils/type-utils";
import type { PurchaseInvoice } from "@/types/purchase-invoice";

export default function PurchaseInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<PurchaseInvoice[]>([]);
  const { 
    invoices: rawInvoices, 
    isLoading,
    handleView,
    handleDelete 
  } = usePurchaseInvoices();
  
  // Process invoices to ensure they match the PurchaseInvoice type
  useEffect(() => {
    const processedInvoices = rawInvoices.map(invoice => {
      // Create properly typed supplier
      const supplier = isSelectQueryError(invoice.supplier) 
        ? { name: 'Fournisseur inconnu', phone: '', email: '' }
        : invoice.supplier || { name: 'Fournisseur non spécifié', phone: '', email: '' };
      
      // Create properly typed purchase order
      const purchase_order = isSelectQueryError(invoice.purchase_order)
        ? { id: '', order_number: '' }
        : invoice.purchase_order || { id: '', order_number: '' };
      
      // Create properly typed delivery note
      const delivery_note = isSelectQueryError(invoice.delivery_note)
        ? { id: '', delivery_number: '' }
        : invoice.delivery_note || { id: '', delivery_number: '' };
      
      // Return a complete PurchaseInvoice object with all required fields
      return {
        id: invoice.id || '',
        invoice_number: invoice.invoice_number || '',
        supplier_id: invoice.supplier_id || '',
        total_amount: invoice.total_amount || 0,
        status: invoice.status || 'pending',
        created_at: invoice.created_at || new Date().toISOString(),
        updated_at: invoice.updated_at || new Date().toISOString(),
        tax_amount: invoice.tax_amount || 0, // Provide default value
        payment_status: invoice.payment_status || 'pending', // Provide default value
        due_date: invoice.due_date || new Date().toISOString(), // Provide default value
        paid_amount: invoice.paid_amount || 0, // Provide default value
        remaining_amount: invoice.remaining_amount || invoice.total_amount || 0, // Provide default value
        discount: invoice.discount || 0, // Provide default value
        notes: invoice.notes || '', // Provide default value
        shipping_cost: invoice.shipping_cost || 0, // Provide default value
        supplier,
        purchase_order,
        delivery_note
      } as PurchaseInvoice;
    });
    
    // Filter processed invoices based on search query
    const filtered = processedInvoices.filter(invoice => 
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredInvoices(filtered);
  }, [rawInvoices, searchQuery]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <PurchaseInvoiceHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

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
      </div>
    </DashboardLayout>
  );
}
