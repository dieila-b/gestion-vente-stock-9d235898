
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Income } from "@/types/outcome";

interface IncomesListProps {
  incomes: Income[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function IncomesList({ incomes, onDelete, isLoading = false }: IncomesListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Chargement des revenus...</p>
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
        <CardTitle>Liste des revenus</CardTitle>
      </CardHeader>
      <CardContent>
        {incomes.length === 0 ? (
          <p className="text-center py-4">Aucun revenu enregistré</p>
        ) : (
          <div className="divide-y">
            {incomes.map((income) => (
              <div key={income.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{income.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(income.created_at)} - {income.category?.name || "Catégorie inconnue"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">
                      {income.amount.toLocaleString()} GNF
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(income.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
