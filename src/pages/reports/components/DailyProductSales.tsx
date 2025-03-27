
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DailyProductSales as DailyProductSalesType } from '../hooks/useDailyReportQueries';

interface DailyProductSalesProps {
  salesByProduct?: DailyProductSalesType[];
}

export function DailyProductSalesTable({ salesByProduct }: DailyProductSalesProps) {
  return (
    <div>
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
            {salesByProduct?.map((sale, index) => (
              <TableRow key={index}>
                <TableCell>{sale.product_name}</TableCell>
                <TableCell className="text-right">{sale.total_quantity}</TableCell>
              </TableRow>
            ))}
            {(!salesByProduct || salesByProduct.length === 0) && (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Aucune vente aujourd'hui
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
