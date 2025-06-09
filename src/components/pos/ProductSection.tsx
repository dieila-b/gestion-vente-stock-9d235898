
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SearchBar } from "@/components/pos/SearchBar";
import { CategoryFilter } from "@/components/pos/CategoryFilter";
import { ProductCard } from "@/components/pos/ProductCard";
import { Product } from "@/types/pos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="flex flex-col h-full">
      {/* Header compact avec contrôles */}
      <div className="flex-shrink-0 space-y-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
          <Select
            value={selectedPDV}
            onValueChange={setSelectedPDV}
          >
            <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] glass-effect text-sm">
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
          <div className="w-full sm:flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      
      {/* Zone des produits avec scroll optimisé */}
      <Card className="flex-1 enhanced-glass min-h-0">
        <div className="h-full p-3 lg:p-4 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4">
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
          
          {/* Pagination compacte */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 lg:gap-4 mt-3 lg:mt-6 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="glass-effect h-8 w-8 lg:h-10 lg:w-10"
              >
                <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
              <span className="text-xs lg:text-sm whitespace-nowrap">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="glass-effect h-8 w-8 lg:h-10 lg:w-10"
              >
                <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
