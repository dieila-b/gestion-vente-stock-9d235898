
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseInvoicesList } from "@/components/purchase-invoices/PurchaseInvoicesList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function PurchaseInvoices() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient">
              Factures d'Achat
            </h1>
            <p className="text-muted-foreground">
              Gérez vos factures fournisseurs
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>

        <PurchaseInvoicesList />
      </div>
    </DashboardLayout>
  );
}
