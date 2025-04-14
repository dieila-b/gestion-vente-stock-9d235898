
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseInvoiceHeader } from "@/components/purchases/invoices/PurchaseInvoiceHeader";
import { PurchaseInvoiceList } from "@/components/purchases/invoices/PurchaseInvoiceList";
import { usePurchaseInvoices } from "@/hooks/use-purchase-invoices";

export default function PurchaseInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    invoices, 
    isLoading,
    handleView,
    handleDelete 
  } = usePurchaseInvoices();
  
  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
