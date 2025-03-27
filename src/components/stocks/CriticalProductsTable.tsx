
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface CriticalProduct {
  id: string;
  product: {
    reference?: string;
    name: string;
    category: string;
  };
  totalQuantity: number;
  status: 'out_of_stock' | 'low_stock';
  unit_price: number;
}

interface CriticalProductsTableProps {
  products: CriticalProduct[];
  isLoading: boolean;
}

export function CriticalProductsTable({ products, isLoading }: CriticalProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(product => 
    product.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="enhanced-glass p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gradient">
          Produits Critiques
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 glass-effect"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="glass-effect">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            Chargement des données...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun produit critique à afficher
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product?.reference || 'N/A'}</TableCell>
                  <TableCell>{item.product?.name}</TableCell>
                  <TableCell>{item.product?.category}</TableCell>
                  <TableCell className="text-right">{item.totalQuantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === 'out_of_stock' ? 'destructive' : 'secondary'}
                    >
                      {item.status === 'out_of_stock' ? 'Rupture' : 'Stock Faible'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('fr-FR').format(item.totalQuantity * (item.unit_price || 0))} GNF
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
