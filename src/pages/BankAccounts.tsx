
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function BankAccounts() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountType, setAccountType] = useState("checking");

  const { data: bankAccounts, refetch } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('bank_accounts')
        .insert([
          {
            name,
            bank_name: bankName,
            account_number: accountNumber,
            account_type: accountType,
            initial_balance: initialBalance,
            current_balance: initialBalance,
          }
        ]);

      if (error) throw error;

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
    <DashboardLayout>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bankAccounts?.map((account) => (
            <Card key={account.id} className="p-6 enhanced-glass">
              <div className="space-y-2">
                <h3 className="font-semibold">{account.name}</h3>
                <div className="text-sm text-muted-foreground">
                  Banque: {account.bank_name || "Non spécifié"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Type: {account.account_type === "checking" ? "Compte courant" : 
                        account.account_type === "savings" ? "Compte épargne" : 
                        account.account_type === "business" ? "Compte professionnel" : 
                        account.account_type}
                </div>
                <div className="text-sm text-muted-foreground">
                  Solde actuel: {account.current_balance} €
                </div>
                <div className="text-sm text-muted-foreground">
                  Solde initial: {account.initial_balance} €
                </div>
              </div>
            </Card>
          ))}
          {bankAccounts?.length === 0 && (
            <Card className="p-6 enhanced-glass col-span-full">
              <div className="text-center text-muted-foreground">
                Aucun compte bancaire enregistré
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
