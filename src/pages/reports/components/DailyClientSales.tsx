
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
import { DailyClientSales as DailyClientSalesType } from '../hooks/useDailyReportQueries';

interface DailyClientSalesProps {
  clientSales?: DailyClientSalesType[];
}

export function DailyClientSalesTable({ clientSales }: DailyClientSalesProps) {
  return (
    <div>
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
            {clientSales?.map((sale, index) => (
              <TableRow key={index}>
                <TableCell>{sale.client.company_name || sale.client.contact_name}</TableCell>
                <TableCell className="text-right">{formatGNF(sale.total_amount)}</TableCell>
                <TableCell className="text-right text-green-500">
                  {formatGNF(sale.paid_amount)}
                </TableCell>
                <TableCell className="text-right text-yellow-500">
                  {formatGNF(sale.remaining_amount)}
                </TableCell>
              </TableRow>
            ))}
            {(!clientSales || clientSales.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Aucune vente client aujourd'hui
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
