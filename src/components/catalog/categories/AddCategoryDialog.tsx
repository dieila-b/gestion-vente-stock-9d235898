
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCategoryDialog({ isOpen, onClose, onSuccess }: AddCategoryDialogProps) {
  const [categoryInput, setCategoryInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCategory = async () => {
    if (!categoryInput.trim()) {
      toast.error("Veuillez entrer un nom de catégorie");
      return;
    }

    try {
      setIsLoading(true);
      
      // Créer un produit de référence pour la catégorie
      const { data, error } = await supabase
        .from('catalog')
        .insert({ 
          name: `Produit ${categoryInput}`,
          category: categoryInput,
          price: 0,
          stock: 0
        })
        .select();

      if (error) {
        console.error('Error adding category:', error);
        toast.error("Erreur lors de l'ajout de la catégorie");
        return;
      }

      toast.success("Catégorie ajoutée avec succès");
      setCategoryInput("");
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error("Erreur lors de l'ajout de la catégorie");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onClick={onClose}
            className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleAddCategory}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
