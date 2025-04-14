
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CatalogProduct } from "@/types/catalog";
import { UseMutationResult } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useProductUnits } from "@/hooks/use-product-units";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  addProductMutation: UseMutationResult<any, PostgrestError, Omit<CatalogProduct, 'id'>, unknown>;
}

const defaultProduct: Omit<CatalogProduct, 'id'> = {
  name: "",
  description: "",
  price: 0,
  purchase_price: 0,
  category: "",
  stock: 0,
  reference: "",
  created_at: new Date().toISOString(),
  unit_id: undefined,
  image_url: undefined
};

export const AddProductForm = ({ isOpen, onClose, addProductMutation }: AddProductFormProps) => {
  const { units, isLoading: unitsLoading } = useProductUnits();
  const [newProduct, setNewProduct] = useState<Omit<CatalogProduct, 'id'>>(defaultProduct);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery({
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

  useEffect(() => {
    if (isOpen) {
      const date = new Date();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const reference = `PRD${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${randomNum}`;
      setNewProduct({ ...defaultProduct, reference });
    }
  }, [isOpen]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setNewProduct(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await addProductMutation.mutateAsync(newProduct);
      onClose();
      setNewProduct(defaultProduct);
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
    }
  };

  const handlePriceChange = (value: string, field: 'price' | 'purchase_price') => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanValue;
    
    setNewProduct({ 
      ...newProduct, 
      [field]: formattedValue === '' ? 0 : parseFloat(formattedValue) 
    });
  };

  const handleStockChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    setNewProduct({ 
      ...newProduct, 
      stock: cleanValue === '' ? 0 : parseInt(cleanValue, 10)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 enhanced-glass animate-in fade-in zoom-in">
        <h2 className="text-2xl font-bold mb-6 text-gradient">Nouveau Produit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm text-muted-foreground mb-2 block">Image du produit</label>
            <ImageUpload
              onUpload={handleImageUpload}
              value={newProduct.image_url}
              disabled={uploading}
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <div>
              <label className="text-sm text-muted-foreground">Nom du produit *</label>
              <Input
                className="enhanced-glass mt-1"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea
                className="enhanced-glass mt-1 min-h-[100px]"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Prix de vente (GNF) *</label>
            <Input
              className="enhanced-glass mt-1"
              value={newProduct.price}
              onChange={(e) => handlePriceChange(e.target.value, 'price')}
              inputMode="decimal"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Prix d'achat (GNF)</label>
            <Input
              className="enhanced-glass mt-1"
              value={newProduct.purchase_price}
              onChange={(e) => handlePriceChange(e.target.value, 'purchase_price')}
              inputMode="decimal"
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Référence</label>
            <Input
              className="enhanced-glass mt-1"
              value={newProduct.reference}
              readOnly
              disabled
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Catégorie</label>
            <Select
              value={newProduct.category}
              onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
            >
              <SelectTrigger className="enhanced-glass mt-1">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    + Nouvelle catégorie
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {newProduct.category === "new" && (
              <Input
                className="enhanced-glass mt-2"
                placeholder="Entrez une nouvelle catégorie"
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                value={newProduct.category === "new" ? "" : newProduct.category}
              />
            )}
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">Stock</label>
            <Input
              className="enhanced-glass mt-1"
              value={newProduct.stock}
              onChange={(e) => handleStockChange(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Unité</label>
            <Select
              value={newProduct.unit_id}
              onValueChange={(value) => setNewProduct({ ...newProduct, unit_id: value })}
            >
              <SelectTrigger className="enhanced-glass mt-1">
                <SelectValue placeholder="Sélectionner une unité" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-white/10">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="enhanced-glass"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={addProductMutation.isPending || uploading}
          >
            {addProductMutation.isPending ? 'Ajout en cours...' : 'Ajouter'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
