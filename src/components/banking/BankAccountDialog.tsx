
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { BankAccount } from "@/types/bank-account";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BankAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount | null;
  onSubmit: (data: Partial<BankAccount>) => void;
}

export function BankAccountDialog({ isOpen, onClose, account, onSubmit }: BankAccountDialogProps) {
  const form = useForm({
    defaultValues: {
      name: account?.name || "",
      bank_name: account?.bank_name || "",
      account_number: account?.account_number || "",
      account_type: account?.account_type || "checking",
      initial_balance: account?.initial_balance || 0,
      current_balance: account?.current_balance || 0,
      currency: account?.currency || "GNF",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: account?.name || "",
        bank_name: account?.bank_name || "",
        account_number: account?.account_number || "",
        account_type: account?.account_type || "checking",
        initial_balance: account?.initial_balance || 0,
        current_balance: account?.current_balance || 0,
        currency: account?.currency || "GNF",
      });
    }
  }, [isOpen, account, form]);

  const handleSubmit = (data: any) => {
    // Convert numeric strings to numbers
    const parsedData = {
      ...data,
      initial_balance: parseFloat(data.initial_balance),
      current_balance: parseFloat(data.current_balance),
    };
    onSubmit(parsedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {account ? "Modifier un compte bancaire" : "Ajouter un compte bancaire"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du compte</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du compte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la banque</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de la banque" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de compte</FormLabel>
                  <FormControl>
                    <Input placeholder="Numéro de compte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de compte</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type de compte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="checking">Compte courant</SelectItem>
                      <SelectItem value="savings">Compte d'épargne</SelectItem>
                      <SelectItem value="credit">Ligne de crédit</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initial_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solde initial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solde actuel</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Devise</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une devise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GNF">Franc Guinéen (GNF)</SelectItem>
                      <SelectItem value="USD">Dollar américain (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {account ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
