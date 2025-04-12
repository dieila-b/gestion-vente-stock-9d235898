
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Outcome } from "@/types/outcome";

interface OutcomesListProps {
  outcomes: Outcome[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function OutcomesList({ outcomes, onDelete, isLoading = false }: OutcomesListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Chargement des dépenses...</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des dépenses</CardTitle>
      </CardHeader>
      <CardContent>
        {outcomes.length === 0 ? (
          <p className="text-center py-4">Aucune dépense enregistrée</p>
        ) : (
          <div className="divide-y">
            {outcomes.map((outcome) => (
              <div key={outcome.id} className="py-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-medium">{outcome.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(outcome.date)} - {outcome.category?.name || "Catégorie inconnue"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {outcome.amount.toLocaleString()} GNF
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(outcome.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Méthode: {outcome.payment_method === "cash" ? "Espèces" : 
                             outcome.payment_method === "card" ? "Carte" : 
                             outcome.payment_method === "transfer" ? "Virement" : 
                             outcome.payment_method === "check" ? "Chèque" : 
                             outcome.payment_method}
                  </span>
                  {outcome.receipt_number && (
                    <span>Reçu: {outcome.receipt_number}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
