
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
import { db } from "@/utils/db-adapter";

interface CategoryListProps {
  categories: string[];
  onRefetch: () => void;
}

export function CategoryList({ categories, onRefetch }: CategoryListProps) {
  const [editingCategory, setEditingCategory] = useState<{
    original: string;
    new: string;
  } | null>(null);

  const handleStartEdit = (category: string) => {
    setEditingCategory({ original: category, new: category });
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;

    try {
      const success = await db.update(
        'catalog',
        { category: editingCategory.new },
        'category',
        editingCategory.original
      );

      if (success) {
        toast.success("Catégorie mise à jour avec succès");
        setEditingCategory(null);
        onRefetch();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error("Erreur lors de la mise à jour de la catégorie");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleDelete = async (category: string) => {
    try {
      const success = await db.update(
        'catalog',
        { category: null },
        'category',
        category
      );

      if (success) {
        toast.success("Catégorie supprimée avec succès");
        onRefetch();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Erreur lors de la suppression de la catégorie");
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
        {categories.map((category) => (
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
                    >
                      Sauvegarder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
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
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
