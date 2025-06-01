
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeliveryNotesList } from "@/components/delivery-notes/DeliveryNotesList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DeliveryNoteForm } from "@/components/delivery-notes/DeliveryNoteForm";

export default function DeliveryNotes() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient">
              Bons de Livraison
            </h1>
            <p className="text-muted-foreground">
              Gérez vos bons de livraison et réceptions
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Bon
          </Button>
        </div>

        {showForm ? (
          <Card className="p-6">
            <DeliveryNoteForm onClose={() => setShowForm(false)} />
          </Card>
        ) : (
          <DeliveryNotesList />
        )}
      </div>
    </DashboardLayout>
  );
}
