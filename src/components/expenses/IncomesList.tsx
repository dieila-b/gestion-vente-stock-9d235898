
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatGNF } from "@/lib/currency";
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
              <div key={income.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{income.description}</p>
                  <div className="text-sm text-muted-foreground">
                    <span>{income.category?.name}</span> • 
                    <span className="ml-1">{new Date(income.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-green-500">{formatGNF(income.amount)}</span>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
