
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CategoriesHeaderProps {
  onAddClick: () => void;
}

export function CategoriesHeader({ onAddClick }: CategoriesHeaderProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des catégories</CardTitle>
          <CardDescription>
            Toutes les catégories de produits disponibles
          </CardDescription>
        </div>
        <Button onClick={onAddClick} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une catégorie
        </Button>
      </CardHeader>
      <CardContent>
        {/* Content will be rendered by CategoryListContainer */}
      </CardContent>
    </Card>
  );
}
