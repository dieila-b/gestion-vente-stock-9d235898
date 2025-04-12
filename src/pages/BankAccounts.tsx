import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BankAccount } from "@/types/bank-account";

const BankAccountsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("");
  const [bankName, setBankName] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  const queryClient = useQueryClient();

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BankAccount[];
    },
  });

  const createBankAccount = useMutation({
    mutationFn: async (newAccount: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .insert([newAccount])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Compte bancaire créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateBankAccount = useMutation({
    mutationFn: async (updatedAccount: BankAccount) => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .update(updatedAccount)
        .eq("id", updatedAccount.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Compte bancaire mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteBankAccount = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Compte bancaire supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !accountNumber || !accountType || !bankName) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const newAccount = {
      name,
      account_number: accountNumber,
      account_type: accountType,
      bank_name: bankName,
      initial_balance: initialBalance,
      current_balance: currentBalance || initialBalance,
    };

    createBankAccount.mutate(newAccount);
  };

  const handleEdit = (account: BankAccount) => {
    setIsEditMode(true);
    setSelectedAccount(account);
    setName(account.name);
    setAccountNumber(account.account_number);
    setAccountType(account.account_type);
    setBankName(account.bank_name);
    setInitialBalance(account.initial_balance);
    setCurrentBalance(account.current_balance);
    setOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccount) return;

    const updatedAccount = {
      ...selectedAccount,
      name,
      account_number: accountNumber,
      account_type: accountType,
      bank_name: bankName,
      initial_balance: initialBalance,
      current_balance: currentBalance,
    };

    updateBankAccount.mutate(updatedAccount);
  };

  const handleDelete = (id: string) => {
    deleteBankAccount.mutate(id);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedAccount(null);
    setName("");
    setAccountNumber("");
    setAccountType("");
    setBankName("");
    setInitialBalance(0);
    setCurrentBalance(0);
  };

  const filteredBankAccounts = bankAccounts?.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.account_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.bank_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-between md:flex-row gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">Comptes bancaires</h1>
            <p className="text-muted-foreground">
              Gérez vos comptes bancaires
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
            <Button onClick={() => { setOpen(true); resetForm(); }} className="bg-primary text-primary-foreground">
              Ajouter un compte
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Nom</TableHead>
                <TableHead>N° de compte</TableHead>
                <TableHead>Type de compte</TableHead>
                <TableHead>Banque</TableHead>
                <TableHead className="text-right">Solde initial</TableHead>
                <TableHead className="text-right">Solde actuel</TableHead>
                <TableHead className="text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredBankAccounts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Aucun compte trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredBankAccounts?.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.account_number}</TableCell>
                    <TableCell>{account.account_type}</TableCell>
                    <TableCell>{account.bank_name}</TableCell>
                    <TableCell className="text-right">
                      {account.initial_balance}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.current_balance}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Modifier" : "Créer"} un compte bancaire</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifier les informations du compte bancaire."
                : "Ajouter un nouveau compte bancaire à votre liste."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isEditMode ? handleUpdate : handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="Nom du compte"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">N° de compte</Label>
              <Input
                id="accountNumber"
                placeholder="Numéro de compte"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Type de compte</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Chèque</SelectItem>
                  <SelectItem value="savings">Épargne</SelectItem>
                  <SelectItem value="credit">Crédit</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Banque</Label>
              <Input
                id="bankName"
                placeholder="Nom de la banque"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialBalance">Solde initial</Label>
              <Input
                type="number"
                id="initialBalance"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(Number(e.target.value))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {isEditMode ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BankAccountsPage;
