
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
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { BankAccount } from "@/types/bank-account";

interface BankAccountsTableProps {
  accounts: BankAccount[];
  isLoading: boolean;
  onEdit: (account: BankAccount) => void;
  onDelete: (id: string) => void;
}

export function BankAccountsTable({ accounts, isLoading, onEdit, onDelete }: BankAccountsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom du compte</TableHead>
            <TableHead>Banque</TableHead>
            <TableHead>Numéro de compte</TableHead>
            <TableHead className="text-right">Solde initial</TableHead>
            <TableHead className="text-right">Solde actuel</TableHead>
            <TableHead className="text-right">Devise</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                Chargement des comptes bancaires...
              </TableCell>
            </TableRow>
          ) : accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                Aucun compte bancaire trouvé
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.bank_name || "—"}</TableCell>
                <TableCell>{account.account_number || "—"}</TableCell>
                <TableCell className="text-right">{formatGNF(account.initial_balance || 0)}</TableCell>
                <TableCell className="text-right">{formatGNF(account.current_balance || 0)}</TableCell>
                <TableCell className="text-right">{account.currency || 'GNF'}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
