
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DailyProductSales {
  product_name: string;
  total_quantity: number;
}

interface CustomProductSalesProps {
  salesByProduct?: DailyProductSales[];
  isLoading: boolean;
}

export function CustomProductSalesTable({ salesByProduct, isLoading }: CustomProductSalesProps) {
  return (
    <div id="product-sales">
      <h2 className="text-lg font-semibold mb-4">Ventes par produit</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Quantité vendue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Chargement des données...
                </TableCell>
              </TableRow>
            ) : salesByProduct && salesByProduct.length > 0 ? (
              salesByProduct.map((sale, index) => (
                <TableRow key={index}>
                  <TableCell>{sale.product_name}</TableCell>
                  <TableCell className="text-right">{sale.total_quantity}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Aucune vente sur cette période
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
