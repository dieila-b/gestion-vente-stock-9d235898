
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatGNF } from "@/lib/currency";
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
              <div key={outcome.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{outcome.description}</p>
                  <div className="text-sm text-muted-foreground">
                    <span>{outcome.category?.name}</span> • 
                    <span className="ml-1">{new Date(outcome.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatGNF(outcome.amount)}</span>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
