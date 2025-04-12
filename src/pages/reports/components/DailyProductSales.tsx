
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { DailyProductSales } from "../hooks/types";

interface DailyProductSalesProps {
  salesByProduct?: DailyProductSales[];
  isLoading: boolean;
}

export function DailyProductSales({ salesByProduct, isLoading }: DailyProductSalesProps) {
  return (
    <div id="product-sales">
      <h2 className="text-lg font-semibold mb-4">Ventes par produit</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Quantité vendue</TableHead>
              <TableHead className="text-right">Montant vendu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Chargement des données...
                </TableCell>
              </TableRow>
            ) : salesByProduct && salesByProduct.length > 0 ? (
              salesByProduct.map((sale, index) => (
                <TableRow key={index}>
                  <TableCell>{sale.product_name}</TableCell>
                  <TableCell className="text-right">{sale.total_quantity}</TableCell>
                  <TableCell className="text-right">{formatGNF(sale.total_sales)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
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
