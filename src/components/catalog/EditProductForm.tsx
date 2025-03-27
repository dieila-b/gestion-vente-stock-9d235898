
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CatalogProduct } from "@/types/catalog";
import { UseMutationResult } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";
import { toast } from "sonner";

interface EditProductFormProps {
  product: CatalogProduct;
  isOpen: boolean;
  onClose: () => void;
  updateProductMutation: UseMutationResult<any, PostgrestError, { product: CatalogProduct, onClose: () => void }, unknown>;
}

export const EditProductForm = ({ product, isOpen, onClose, updateProductMutation }: EditProductFormProps) => {
  const [editedProduct, setEditedProduct] = useState<CatalogProduct>(product);

  const handleSubmit = () => {
    if (!editedProduct.name || !editedProduct.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    updateProductMutation.mutate({ product: editedProduct, onClose });
  };

  const handlePriceChange = (value: string, field: 'price' | 'purchase_price') => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanValue;
    
    setEditedProduct({ 
      ...editedProduct, 
      [field]: formattedValue === '' ? 0 : parseFloat(formattedValue) 
    });
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed inset-0 m-auto w-full max-w-md h-fit p-6 enhanced-glass animate-in fade-in zoom-in">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Modifier le Produit</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Nom du produit *</label>
          <Input
            className="enhanced-glass mt-1"
            value={editedProduct.name}
            onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Description</label>
          <Textarea
            className="enhanced-glass mt-1"
            value={editedProduct.description}
            onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Prix de vente (GNF) *</label>
          <Input
            className="enhanced-glass mt-1"
            value={editedProduct.price}
            onChange={(e) => handlePriceChange(e.target.value, 'price')}
            inputMode="decimal"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Prix d'achat (GNF)</label>
          <Input
            className="enhanced-glass mt-1"
            value={editedProduct.purchase_price}
            onChange={(e) => handlePriceChange(e.target.value, 'purchase_price')}
            inputMode="decimal"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Référence</label>
          <Input
            className="enhanced-glass mt-1"
            value={editedProduct.reference}
            onChange={(e) => setEditedProduct({ ...editedProduct, reference: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Catégorie</label>
          <Input
            className="enhanced-glass mt-1"
            value={editedProduct.category}
            onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Stock</label>
          <Input
            type="number"
            className="enhanced-glass mt-1"
            value={editedProduct.stock}
            onChange={(e) => setEditedProduct({ ...editedProduct, stock: Number(e.target.value) })}
          />
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="enhanced-glass"
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Mettre à jour</Button>
        </div>
      </div>
    </Card>
  );
};
