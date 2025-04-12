import { useState, useEffect, FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";

interface BankAccount {
  id?: string;
  name: string;
  account_number: string;
  bank_name: string;
  currency: string;
  created_at?: string;
}

const BankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: initialAccounts, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BankAccount[];
    }
  });

  useEffect(() => {
    if (initialAccounts) {
      setAccounts(initialAccounts);
    }
  }, [initialAccounts]);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setAccounts(data as BankAccount[]);
  };

  const handleAddAccount = () => {
    setAccounts([
      ...accounts,
      {
        name: "",
        account_number: "",
        bank_name: "",
        currency: "GNF",
      },
    ]);
  };

  const handleRemoveAccount = (index: number) => {
    const newAccounts = [...accounts];
    newAccounts.splice(index, 1);
    setAccounts(newAccounts);
  };

  const handleAccountChange = (index: number, field: string, value: string) => {
    const newAccounts = [...accounts];
    newAccounts[index][field] = value;
    setAccounts(newAccounts);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Fix the INSERT operation by ensuring name is provided for each account
      const accountsToInsert = accounts.map(account => ({
        ...account,
        name: account.name || 'Default Account Name' // Ensure name has a value
      }));
      
      const { error } = await supabase
        .from('bank_accounts')
        .insert(accountsToInsert);
      
      if (error) throw error;
      
      toast.success("Comptes bancaires enregistrés avec succès");
      await fetchAccounts();
      setAccounts([]);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving accounts:", error);
      toast.error("Erreur lors de l'enregistrement des comptes");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Comptes Bancaires</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {accounts.map((account, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Nom du compte"
                value={account.name}
                onChange={(e) => handleAccountChange(index, "name", e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Numéro de compte"
                value={account.account_number}
                onChange={(e) => handleAccountChange(index, "account_number", e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Nom de la banque"
                value={account.bank_name}
                onChange={(e) => handleAccountChange(index, "bank_name", e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Devise"
                value={account.currency}
                onChange={(e) => handleAccountChange(index, "currency", e.target.value)}
                required
              />
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => handleRemoveAccount(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddAccount}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter un compte
        </Button>
        
        {/* Fix the button variant from "primary" to "default" */}
        <div className="mt-6 flex justify-end">
          <Button 
            type="submit" 
            variant="default" 
            disabled={isSubmitting || accounts.length === 0}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer les comptes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BankAccounts;
