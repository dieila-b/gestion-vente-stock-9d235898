
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOutcomeCategories } from "@/hooks/use-outcome-categories";
import { toast } from "sonner";
import { useIncomeCategories } from "@/hooks/use-income-categories";

export default function ExpenseOutcome() {
  const [activeTab, setActiveTab] = useState("outcomes");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const outcomeCategories = useOutcomeCategories();
  const incomeCategories = useIncomeCategories();
  
  // Get the relevant categories based on active tab
  const categories = activeTab === "outcomes" 
    ? outcomeCategories.categories 
    : incomeCategories.categories;
  
  const isLoading = activeTab === "outcomes" 
    ? outcomeCategories.isLoading 
    : incomeCategories.isLoading;
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Veuillez saisir un nom de catégorie");
      return;
    }
    
    setIsAddingCategory(true);
    
    try {
      const result = activeTab === "outcomes" 
        ? await outcomeCategories.addCategory(newCategoryName)
        : await incomeCategories.addCategory(newCategoryName);
      
      if (result) {
        setNewCategoryName("");
        toast.success(`Catégorie ajoutée avec succès`);
      }
    } finally {
      setIsAddingCategory(false);
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        const result = activeTab === "outcomes" 
          ? await outcomeCategories.deleteCategory(id)
          : await incomeCategories.deleteCategory(id);
        
        if (result) {
          toast.success(`Catégorie supprimée avec succès`);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Erreur lors de la suppression de la catégorie");
      }
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gestion des Dépenses et Revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="outcomes" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="outcomes">Dépenses</TabsTrigger>
              <TabsTrigger value="incomes">Revenus</TabsTrigger>
            </TabsList>
            
            <TabsContent value="outcomes" className="space-y-6">
              <h2 className="text-xl font-semibold">Catégories de Dépenses</h2>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Nom de la catégorie"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddCategory} 
                  disabled={isAddingCategory || !newCategoryName.trim()}
                >
                  {isAddingCategory ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
              
              {isLoading ? (
                <div>Chargement des catégories...</div>
              ) : (
                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <div className="text-muted-foreground">Aucune catégorie trouvée</div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex justify-between items-center p-3 border rounded-md">
                        <span>{category.name}</span>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="incomes" className="space-y-6">
              <h2 className="text-xl font-semibold">Catégories de Revenus</h2>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Nom de la catégorie"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddCategory} 
                  disabled={isAddingCategory || !newCategoryName.trim()}
                >
                  {isAddingCategory ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
              
              {isLoading ? (
                <div>Chargement des catégories...</div>
              ) : (
                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <div className="text-muted-foreground">Aucune catégorie trouvée</div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex justify-between items-center p-3 border rounded-md">
                        <span>{category.name}</span>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
