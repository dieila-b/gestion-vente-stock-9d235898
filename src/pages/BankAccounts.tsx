import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { supabase } from "@/integrations/supabase/client";
import { BankAccount } from "@/types/db-adapter";
import { safeBankAccount } from "@/utils/supabase-safe-query";

interface BankAccountWithMeta extends BankAccount {
  formattedCreatedAt: string;
}

export default function BankAccounts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  // Fetch bank accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create bank account
  const createBankAccount = useMutation({
    mutationFn: async (data: Partial<BankAccount>) => {
      const { data: newAccount, error } = await supabase
        .from("bank_accounts")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return newAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Compte bancaire créé avec succès");
      setIsCreating(false);
    },
  });

  // Update bank account
  const updateBankAccount = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BankAccount> }) => {
      const { error } = await supabase
        .from("bank_accounts")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Compte bancaire mis à jour avec succès");
      setIsUpdating(false);
      setIsVisible(false);
    },
  });

  // Delete bank account
  const deleteBankAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      toast.success("Compte bancaire supprimé avec succès");
    },
  });

  const formattedAccounts = accounts.map(account => ({
    ...account,
    formattedCreatedAt: account.created_at
      ? format(new Date(account.created_at), "dd/MM/yyyy", { locale: fr })
      : "-",
  }));

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Comptes Bancaires</h1>
        <Button onClick={() => navigate("/bank-accounts/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau Compte Bancaire
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Chargement des comptes bancaires...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Aucun compte bancaire trouvé</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom du compte</TableHead>
              <TableHead>Banque</TableHead>
              <TableHead>Type de compte</TableHead>
              <TableHead>Solde actuel</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.bank_name}</TableCell>
                <TableCell>{account.account_type}</TableCell>
                <TableCell>{account.current_balance}</TableCell>
                <TableCell>{account.formattedCreatedAt}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/bank-accounts/edit/${account.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBankAccount.mutate(account.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
