
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CategoryListProps {
  categories: string[];
  onRefetch: () => void;
}

export function CategoryList({ categories, onRefetch }: CategoryListProps) {
  const [editingCategory, setEditingCategory] = useState<{
    original: string;
    new: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = (category: string) => {
    setEditingCategory({ original: category, new: category });
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('catalog')
        .update({ category: editingCategory.new })
        .eq('category', editingCategory.original);

      if (error) {
        console.error('Error updating category:', error);
        toast.error("Erreur lors de la mise à jour de la catégorie");
        return;
      }

      toast.success("Catégorie mise à jour avec succès");
      setEditingCategory(null);
      onRefetch();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error("Erreur lors de la mise à jour de la catégorie");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleDelete = async (category: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('catalog')
        .update({ category: null })
        .eq('category', category);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error("Erreur lors de la suppression de la catégorie");
        return;
      }

      toast.success("Catégorie supprimée avec succès");
      onRefetch();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Erreur lors de la suppression de la catégorie");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom de la catégorie</TableHead>
          <TableHead className="w-[200px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
              Aucune catégorie trouvée. Cliquez sur "Ajouter une catégorie" pour en créer une.
            </TableCell>
          </TableRow>
        ) : (
          categories.map((category) => (
            <TableRow key={category}>
              <TableCell>
                {editingCategory?.original === category ? (
                  <Input
                    value={editingCategory.new}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        new: e.target.value,
                      })
                    }
                    className="max-w-[300px]"
                    disabled={isLoading}
                  />
                ) : (
                  category
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {editingCategory?.original === category ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                      >
                        {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStartEdit(category)}
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(category)}
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
