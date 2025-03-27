
import { CatalogProduct } from "@/types/catalog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatGNF } from "@/lib/currency";

interface CatalogProductTableProps {
  products: CatalogProduct[];
  onEdit: (product: CatalogProduct) => void;
  onDelete: (product: CatalogProduct) => void;
}

export function CatalogProductTable({ products, onEdit, onDelete }: CatalogProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-white/5">
          <TableHead className="text-white/80">Nom</TableHead>
          <TableHead className="text-white/80">Référence</TableHead>
          <TableHead className="text-white/80">Stock</TableHead>
          <TableHead className="text-white/80">Prix d'achat</TableHead>
          <TableHead className="text-white/80">Prix de vente</TableHead>
          <TableHead className="text-white/80">Valeur stock (achat)</TableHead>
          <TableHead className="text-white/80">Valeur stock (vente)</TableHead>
          <TableHead className="text-right text-white/80">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
            <TableCell className="font-medium text-white">
              {product.name}
              {product.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.description}
                </p>
              )}
            </TableCell>
            <TableCell>
              {product.reference ? (
                <Badge variant="outline" className="bg-primary/10">
                  {product.reference}
                </Badge>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock || 0}
              </Badge>
            </TableCell>
            <TableCell>{formatGNF(product.purchase_price)}</TableCell>
            <TableCell className="font-bold text-gradient">
              {formatGNF(product.price)}
            </TableCell>
            <TableCell className="text-white/80">
              {formatGNF(product.purchase_price * (product.stock || 0))}
            </TableCell>
            <TableCell className="font-medium text-gradient">
              {formatGNF(product.price * (product.stock || 0))}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="enhanced-glass"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="enhanced-glass"
                  onClick={() => onDelete(product)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

