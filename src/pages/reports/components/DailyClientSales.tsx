
import React from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { DailyClientSales as DailyClientSalesType } from "../hooks/types";

interface DailyClientSalesProps {
  clientSales: DailyClientSalesType[];
  isLoading: boolean;
}

export function DailyClientSales({ clientSales, isLoading }: DailyClientSalesProps) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Ventes par client</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : clientSales.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucune vente par client pour cette période
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Montant total</TableHead>
              <TableHead className="text-right">Montant payé</TableHead>
              <TableHead className="text-right">Reste à payer</TableHead>
              <TableHead className="text-center">État</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientSales.map((clientSale) => (
              <TableRow key={clientSale.client_id}>
                <TableCell className="font-medium">{clientSale.client.company_name}</TableCell>
                <TableCell className="text-right">{formatGNF(clientSale.total)}</TableCell>
                <TableCell className="text-right text-green-500">{formatGNF(clientSale.paid_amount)}</TableCell>
                <TableCell className="text-right text-yellow-500">{formatGNF(clientSale.remaining_amount)}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={clientSale.remaining_amount === 0 ? "default" : "outline"}
                    className={clientSale.remaining_amount === 0 ? "bg-green-600" : "bg-yellow-600"}
                  >
                    {clientSale.remaining_amount === 0 ? "Payé" : "Partiel"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
