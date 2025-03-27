
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Plus, Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  status: string;
}

export default function Inventory() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
      
      if (error) throw error;
      
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'inventaire",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé de l'inventaire"
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const itemData = {
      name: formData.get('name') as string,
      quantity: quantity,
      category: formData.get('category') as string,
      status: quantity > 0 ? "En stock" : "Rupture"
    };

    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('inventory')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;

        setItems(items.map(item => item.id === editingItem.id ? { ...item, ...itemData } : item));
        toast({
          title: "Produit modifié",
          description: "Le produit a été mis à jour dans l'inventaire"
        });
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('inventory')
          .insert([itemData])
          .select();

        if (error) throw error;

        if (data) {
          setItems([...items, data[0]]);
          toast({
            title: "Produit ajouté",
            description: "Le nouveau produit a été ajouté à l'inventaire"
          });
        }
      }
      
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le produit",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <p>Chargement de l'inventaire...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gradient">Inventaire</h1>
          <Button 
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="glass-effect hover:neon-glow"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 enhanced-glass card-hover">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Package className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Produits</p>
                <p className="text-2xl font-bold text-gradient">{items.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="enhanced-glass p-6">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Rechercher un produit..." 
                  className="pl-10 glass-effect"
                />
              </div>
              <Button variant="outline" className="glass-effect">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
            </div>

            <div className="grid gap-4">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="glass-effect p-4 rounded-lg grid grid-cols-5 items-center gap-4"
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground">{item.category}</div>
                  <div className="text-center">{item.quantity}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === "En stock" ? "bg-green-500/20 text-green-500" :
                      item.status === "Stock faible" ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-red-500/20 text-red-500"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="glass-effect"
                      onClick={() => handleEdit(item)}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {isFormOpen && (
          <Card className="fixed inset-0 m-auto w-full max-w-md h-fit p-6 enhanced-glass animate-in fade-in zoom-in">
            <h2 className="text-2xl font-bold mb-6 text-gradient">
              {editingItem ? "Modifier le produit" : "Ajouter un produit"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom du produit</label>
                <Input 
                  name="name"
                  defaultValue={editingItem?.name}
                  className="glass-effect mt-1" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantité</label>
                <Input 
                  name="quantity"
                  type="number" 
                  defaultValue={editingItem?.quantity}
                  className="glass-effect mt-1" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Input 
                  name="category"
                  defaultValue={editingItem?.category}
                  className="glass-effect mt-1" 
                  required 
                />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                  }}
                  className="glass-effect"
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingItem ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
