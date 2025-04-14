
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash } from "lucide-react";
import { db } from "@/utils/db-adapter";

export function CategoriesTab() {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{
    original: string;
    new: string;
  } | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");

  const { data: categories = [], refetch } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('category')
        .not('category', 'is', null)
        .order('category');

      if (error) {
        toast.error("Erreur lors du chargement des catégories");
        throw error;
      }

      const uniqueCategories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);
      return uniqueCategories;
    }
  });

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Veuillez entrer un nom de catégorie");
      return;
    }

    try {
      // Use the db adapter instead of direct supabase call
      const result = await db.insert('catalog', { 
        name: newCategory,
        category: newCategory,
        price: 0,
        stock: 0
      });

      if (result) {
        toast.success("Catégorie ajoutée avec succès");
        setNewCategory("");
        refetch();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error("Erreur lors de l'ajout de la catégorie");
    }
  };

  const handleAddCategoryFromDialog = async () => {
    if (!categoryInput.trim()) {
      toast.error("Veuillez entrer un nom de catégorie");
      return;
    }

    try {
      // Use the db adapter instead of direct supabase call
      const result = await db.insert('catalog', { 
        name: categoryInput,
        category: categoryInput,
        price: 0,
        stock: 0
      });

      if (result) {
        toast.success("Catégorie ajoutée avec succès");
        setCategoryInput("");
        setIsAddDialogOpen(false);
        refetch();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error("Erreur lors de l'ajout de la catégorie");
    }
  };

  const handleStartEdit = (category: string) => {
    setEditingCategory({ original: category, new: category });
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;

    try {
      // Use the db adapter instead of direct supabase call
      const success = await db.update(
        'catalog',
        { category: editingCategory.new },
        'category',
        editingCategory.original
      );

      if (success) {
        toast.success("Catégorie mise à jour avec succès");
        setEditingCategory(null);
        refetch();
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
      // Use the db adapter instead of direct supabase call
      const success = await db.update(
        'catalog',
        { category: null },
        'category',
        category
      );

      if (success) {
        toast.success("Catégorie supprimée avec succès");
        refetch();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Erreur lors de la suppression de la catégorie");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des catégories</CardTitle>
            <CardDescription>
              Toutes les catégories de produits disponibles
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une catégorie
          </Button>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#121212] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
            <DialogDescription className="text-gray-400">
              Créez une nouvelle catégorie pour organiser vos produits
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-white">Nom de la catégorie</Label>
              <Input 
                id="categoryName" 
                placeholder="Nom de la catégorie"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="bg-[#1e1e1e] border-gray-700 text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleAddCategoryFromDialog}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
