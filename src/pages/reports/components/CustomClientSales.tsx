
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
import { Client } from "@/types/client_unified";
import { DailyClientSales } from "../hooks/types";

interface CustomClientSalesProps {
  clientSales?: DailyClientSales[];
  isLoading: boolean;
}

export function CustomClientSalesTable({ clientSales, isLoading }: CustomClientSalesProps) {
  return (
    <div id="client-sales">
      <h2 className="text-lg font-semibold mb-4">Ventes par client</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Montant total</TableHead>
              <TableHead className="text-right">Montant payé</TableHead>
              <TableHead className="text-right">Reste à payer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Chargement des données...
                </TableCell>
              </TableRow>
            ) : clientSales && clientSales.length > 0 ? (
              clientSales.map((sale, index) => (
                <TableRow key={index}>
                  <TableCell>{sale.client.company_name || 'Client inconnu'}</TableCell>
                  <TableCell className="text-right">{formatGNF(sale.total)}</TableCell>
                  <TableCell className="text-right text-green-500">
                    {formatGNF(sale.paid_amount)}
                  </TableCell>
                  <TableCell className="text-right text-yellow-500">
                    {formatGNF(sale.remaining_amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Aucune vente client sur cette période
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
