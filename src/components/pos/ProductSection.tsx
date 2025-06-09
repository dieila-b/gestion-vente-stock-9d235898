
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CategoryFilter } from "@/components/pos/CategoryFilter";
import { ProductCard } from "@/components/pos/ProductCard";
import { Product } from "@/types/pos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface ProductSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedPDV: string;
  setSelectedPDV: (pdv: string) => void;
  posLocations: any[];
  currentProducts: Product[];
  categories: string[];
  currentPage: number;
  totalPages: number;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  onAddToCart: (product: Product) => void;
  availableStock: Record<string, number>;
}

export function ProductSection({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedPDV,
  setSelectedPDV,
  posLocations,
  currentProducts,
  categories,
  currentPage,
  totalPages,
  goToPrevPage,
  goToNextPage,
  onAddToCart,
  availableStock
}: ProductSectionProps) {
  return (
    <div className="h-full flex flex-col p-3 gap-3 overflow-hidden">
      {/* Contrôles de recherche et filtres - compacts */}
      <div className="flex-shrink-0 space-y-2">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Sélection PDV */}
        <Select value={selectedPDV} onValueChange={setSelectedPDV}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un PDV" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Tous les PDV</SelectItem>
            {posLocations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre catégories */}
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      
      {/* Zone des produits - prend tout l'espace restant */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 p-3 flex flex-col overflow-hidden">
            {/* Grille des produits - scrollable */}
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pr-2">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => onAddToCart(product)}
                    availableStock={availableStock[product.id] !== undefined ? availableStock[product.id] : product.stock}
                  />
                ))}
              </div>
            </ScrollArea>
            
            {/* Pagination - compacte et fixe */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-2 pt-2 border-t flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm whitespace-nowrap px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
