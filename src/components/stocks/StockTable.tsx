
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { StockItem } from "@/hooks/stock-statistics/types";

interface StockTableProps {
  items: StockItem[];
}

export function StockTable({ items }: StockTableProps) {
  console.log("Stock table items:", items);
  
  if (!items || items.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Entrepôt</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead className="text-right">Prix unitaire</TableHead>
              <TableHead className="text-right">Valeur totale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                Aucun article trouvé
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Entrepôt</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Prix unitaire</TableHead>
            <TableHead className="text-right">Valeur totale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            // Safely handle missing product data
            if (!item.product) {
              console.warn("Skipping item with no product data:", item);
              return null;
            }
            
            return (
              <TableRow key={item.id}>
                <TableCell>{item.product.reference || "N/A"}</TableCell>
                <TableCell>{item.product.category || "N/A"}</TableCell>
                <TableCell className="font-medium">{item.product.name}</TableCell>
                <TableCell>{item.name || "N/A"}</TableCell>
                <TableCell className="text-right">{item.quantity || 0}</TableCell>
                <TableCell className="text-right">
                  {formatGNF(item.unit_price || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatGNF(item.total_value || 0)}
                </TableCell>
              </TableRow>
            );
          }).filter(Boolean)}
        </TableBody>
      </Table>
    </div>
  );
}
