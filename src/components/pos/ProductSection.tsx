
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, AlertCircle } from "lucide-react";
import { CategoryFilter } from "@/components/pos/CategoryFilter";
import { ProductCard } from "@/components/pos/ProductCard";
import { ClientSelect } from "@/components/pos/ClientSelect";
import { Product } from "@/types/pos";
import { Client } from "@/types/client_unified";
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
  selectedClient: Client | null;
  setSelectedClient: (client: Client) => void;
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
  availableStock,
  selectedClient,
  setSelectedClient
}: ProductSectionProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header avec tous les contrôles en ligne */}
      <div className="flex-shrink-0 p-4 border-b bg-background">
        <div className="space-y-3">
          {/* Titre */}
          <h1 className="text-xl font-bold">Vente au Comptoir</h1>
          
          {/* Ligne principale avec tous les contrôles */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Sélection PDV */}
            <Select value={selectedPDV} onValueChange={setSelectedPDV}>
              <SelectTrigger>
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

            {/* Barre de recherche produit */}
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

            {/* Filtre catégories */}
            <div className="lg:col-span-1">
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Bloc client requis */}
            <div className="flex flex-col justify-center">
              {!selectedClient ? (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-md border border-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs">Client requis</span>
                  <ClientSelect
                    selectedClient={selectedClient}
                    onClientSelect={setSelectedClient}
                  />
                </div>
              ) : (
                <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  ✓ Client sélectionné
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Grille des produits */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pr-2">
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
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 flex justify-center items-center gap-2 p-4 border-t">
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
    </div>
  );
}
