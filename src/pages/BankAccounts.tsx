
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/utils/db-adapter";
import { useQuery } from "@tanstack/react-query";

interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  account_number?: string;
  account_type: string;
  initial_balance: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export default function BankAccounts() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountType, setAccountType] = useState("checking");

  const { data: bankAccounts, refetch } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      const result = await db.query<BankAccount[]>(
        'bank_accounts',
        query => query.select('*').order('created_at', { ascending: false }),
        []
      );
      return result;
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const bankName = formData.get('bankName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const initialBalance = parseFloat(formData.get('initialBalance') as string) || 0;

    try {
      await db.insert('bank_accounts', {
        name,
        bank_name: bankName,
        account_number: accountNumber,
        account_type: accountType,
        initial_balance: initialBalance,
        current_balance: initialBalance,
      });

      toast({
        title: "Succès",
        description: "Le compte bancaire a été créé avec succès",
      });

      setOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du compte",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient animate-fade-in">
          Comptes Bancaires
        </h1>
        <p className="text-muted-foreground animate-fade-in delay-100">
          Gérez vos comptes bancaires et leurs mouvements
        </p>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="enhanced-glass">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Compte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau compte bancaire</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du compte</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Compte principal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Nom de la banque</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Nom de la banque"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Numéro de compte</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  placeholder="FRXX XXXX XXXX XXXX XXXX XXXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Type de compte</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Compte courant</SelectItem>
                    <SelectItem value="savings">Compte épargne</SelectItem>
                    <SelectItem value="business">Compte professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Solde initial</Label>
                <Input
                  id="initialBalance"
                  name="initialBalance"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Création..." : "Créer le compte"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(bankAccounts) && bankAccounts.map((account) => (
          <Card key={account.id} className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">{account.name}</h3>
              <div className="text-sm text-gray-500 mb-4">
                {account.bank_name}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Type de compte</span>
                  <span className="text-sm font-medium">
                    {account.account_type === "checking" && "Compte courant"}
                    {account.account_type === "savings" && "Compte épargne"}
                    {account.account_type === "business" && "Compte professionnel"}
                    {account.account_type !== "checking" && account.account_type !== "savings" && account.account_type !== "business" && account.account_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Solde actuel</span>
                  <span className="text-sm font-medium">{account.current_balance.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Solde initial</span>
                  <span className="text-sm font-medium">{account.initial_balance.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  Voir plus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
