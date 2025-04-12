
import React from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { Loader2 } from "lucide-react";
import type { DailyProductSales as DailyProductSalesType } from "../hooks/types";

interface DailyProductSalesProps {
  salesByProduct: DailyProductSalesType[];
  isLoading: boolean;
}

export function DailyProductSales({ salesByProduct, isLoading }: DailyProductSalesProps) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Ventes par produit</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : salesByProduct.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucune vente par produit pour cette période
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Quantité vendue</TableHead>
              <TableHead className="text-right">Montant des ventes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesByProduct.map((product) => (
              <TableRow key={product.product_id}>
                <TableCell className="font-medium">{product.product_name}</TableCell>
                <TableCell className="text-right">{product.total_quantity}</TableCell>
                <TableCell className="text-right">{formatGNF(product.total_sales)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
