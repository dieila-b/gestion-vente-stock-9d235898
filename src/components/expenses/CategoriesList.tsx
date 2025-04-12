
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the Category type inline to avoid import casing issues
interface Category {
  id: string;
  name: string;
  type?: 'expense' | 'income';
  created_at?: string;
}

interface CategoriesListProps {
  categories: Category[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
  title?: string;
}

export function CategoriesList({ 
  categories, 
  onDelete, 
  isLoading = false,
  title = "Catégories de dépenses"
}: CategoriesListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Chargement des catégories...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-center py-4">Aucune catégorie disponible</p>
        ) : (
          <div className="divide-y">
            {categories.map((category) => (
              <div key={category.id} className="py-3 flex justify-between items-center">
                <span>{category.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(category.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
