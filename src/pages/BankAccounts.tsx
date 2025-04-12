import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatGNF } from "@/lib/currency";
import { BankAccount } from "@/types/db-adapter";

const BankAccounts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const queryClient = useQueryClient();

  const { data: accounts, refetch: refetchAccounts, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BankAccount[];
    },
  });

  const addBankAccount = async (data: Partial<BankAccount>) => {
    try {
      setIsCreating(true);
      // Ensure required fields are provided
      if (!data.name) {
        toast.error("Le nom du compte est requis");
        return;
      }

      const accountData = {
        name: data.name,
        bank_name: data.bank_name || '',
        account_type: data.account_type || 'checking',
        account_number: data.account_number || '',
        initial_balance: data.initial_balance || 0,
        current_balance: data.initial_balance || 0,
      };

      const { data: newAccount, error } = await supabase
        .from('bank_accounts')
        .insert(accountData)  // Send a single object instead of an array
        .select()
        .single();

      if (error) throw error;

      toast.success("Compte bancaire ajouté avec succès");
      refetchAccounts();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error adding bank account:', error);
      toast.error(error.message || "Erreur lors de l'ajout du compte bancaire");
    } finally {
      setIsCreating(false);
    }
  };

  const updateBankAccount = async (id: string, data: Partial<BankAccount>) => {
    try {
      setIsCreating(true);
      const { error } = await supabase
        .from('bank_accounts')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast.success("Compte bancaire mis à jour avec succès");
      refetchAccounts();
      setEditingAccount(null);
    } catch (error: any) {
      console.error('Error updating bank account:', error);
      toast.error(error.message || "Erreur lors de la mise à jour du compte bancaire");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteBankAccount = async (id: string) => {
    try {
      setIsCreating(true);
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Compte bancaire supprimé avec succès");
      refetchAccounts();
    } catch (error: any) {
      console.error('Error deleting bank account:', error);
      toast.error(error.message || "Erreur lors de la suppression du compte bancaire");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Comptes Bancaires</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un compte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un compte bancaire</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau compte bancaire à votre liste.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input id="name" defaultValue="" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bank_name" className="text-right">
                  Nom de la banque
                </Label>
                <Input id="bank_name" defaultValue="" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account_number" className="text-right">
                  Numéro de compte
                </Label>
                <Input id="account_number" defaultValue="" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account_type" className="text-right">
                  Type de compte
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Chèque</SelectItem>
                    <SelectItem value="savings">Épargne</SelectItem>
                    <SelectItem value="credit">Crédit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="initial_balance" className="text-right">
                  Solde initial
                </Label>
                <Input id="initial_balance" defaultValue="0" className="col-span-3" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" onClick={(e) => {
                e.preventDefault();
                const name = (document.getElementById('name') as HTMLInputElement).value;
                const bank_name = (document.getElementById('bank_name') as HTMLInputElement).value;
                const account_number = (document.getElementById('account_number') as HTMLInputElement).value;
                const account_type = (document.querySelector('.SelectValue') as HTMLElement).innerText;
                const initial_balance = parseFloat((document.getElementById('initial_balance') as HTMLInputElement).value);

                addBankAccount({
                  name,
                  bank_name,
                  account_number,
                  account_type,
                  initial_balance,
                });
              }} disabled={isCreating}>
                {isCreating ? 'Ajout en cours...' : 'Ajouter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nom</TableHead>
              <TableHead>Banque</TableHead>
              <TableHead>Numéro de compte</TableHead>
              <TableHead>Type de compte</TableHead>
              <TableHead className="text-right">Solde</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
              </TableRow>
            )}
            {!isLoading && accounts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Aucun compte bancaire trouvé.</TableCell>
              </TableRow>
            )}
            {!isLoading && accounts?.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.bank_name}</TableCell>
                <TableCell>{account.account_number}</TableCell>
                <TableCell>{account.account_type}</TableCell>
                <TableCell className="text-right">{formatGNF(account.current_balance)}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => setEditingAccount(account)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteBankAccount(account.id)}>
                    <Trash className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingAccount && (
        <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier le compte bancaire</DialogTitle>
              <DialogDescription>
                Modifier les informations du compte bancaire.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input id="name" defaultValue={editingAccount.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bank_name" className="text-right">
                  Nom de la banque
                </Label>
                <Input id="bank_name" defaultValue={editingAccount.bank_name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account_number" className="text-right">
                  Numéro de compte
                </Label>
                <Input id="account_number" defaultValue={editingAccount.account_number} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account_type" className="text-right">
                  Type de compte
                </Label>
                <Select defaultValue={editingAccount.account_type}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Chèque</SelectItem>
                    <SelectItem value="savings">Épargne</SelectItem>
                    <SelectItem value="credit">Crédit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="initial_balance" className="text-right">
                  Solde initial
                </Label>
                <Input id="initial_balance" defaultValue={editingAccount.initial_balance.toString()} className="col-span-3" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" onClick={(e) => {
                e.preventDefault();
                const name = (document.getElementById('name') as HTMLInputElement).value;
                const bank_name = (document.getElementById('bank_name') as HTMLInputElement).value;
                const account_number = (document.getElementById('account_number') as HTMLInputElement).value;
                const account_type = (document.querySelector('.SelectValue') as HTMLElement).innerText;
                const initial_balance = parseFloat((document.getElementById('initial_balance') as HTMLInputElement).value);

                updateBankAccount(editingAccount.id, {
                  name,
                  bank_name,
                  account_number,
                  account_type,
                  initial_balance,
                });
              }} disabled={isCreating}>
                {isCreating ? 'Mise à jour en cours...' : 'Mettre à jour'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BankAccounts;
