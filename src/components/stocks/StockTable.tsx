
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { safeProduct } from "@/utils/supabase-safe-query";

interface StockItem {
  id: string;
  quantity: number;
  warehouse?: {
    id: string;
    name: string;
  };
  product?: any;
  [key: string]: any;
}

interface StockTableProps {
  items: StockItem[];
}

export function StockTable({ items }: StockTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const product = safeProduct(item.product);
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.reference || "N/A"}</TableCell>
                <TableCell>{product.category || "N/A"}</TableCell>
                <TableCell className="text-right">{item.quantity || 0}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
