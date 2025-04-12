
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { BankAccountsTable } from "@/components/banking/BankAccountsTable";
import { BankAccountDialog } from "@/components/banking/BankAccountDialog";
import { BankAccountFilter } from "@/components/banking/BankAccountFilter";
import { BankAccount } from "@/types/bank-account";

export default function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("name");

      if (error) throw error;

      // Add currency field with default value if it doesn't exist
      const accountsWithCurrency = data.map((account) => ({
        ...account,
        currency: account.currency || 'GNF'
      })) as BankAccount[];

      setAccounts(accountsWithCurrency);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (account: Partial<BankAccount>) => {
    try {
      // Ensure currency field is included and name is required
      const accountWithCurrency = {
        ...account,
        currency: account.currency || 'GNF',
        name: account.name || ''  // Ensure name is provided
      };

      const { error } = await supabase
        .from("bank_accounts")
        .insert(accountWithCurrency);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      console.error("Error creating bank account:", error);
    }
  };

  const handleUpdate = async (id: string, account: Partial<BankAccount>) => {
    try {
      const { error } = await supabase
        .from("bank_accounts")
        .update(account)
        .eq("id", id);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      console.error("Error updating bank account:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      console.error("Error deleting bank account:", error);
    }
  };

  // Filter accounts based on search text
  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (account.bank_name && account.bank_name.toLowerCase().includes(filterText.toLowerCase())) ||
    (account.account_number && account.account_number.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Comptes Bancaires</h1>
        <Button
          onClick={() => {
            setEditingAccount(null);
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau Compte
        </Button>
      </div>

      <BankAccountFilter
        filterText={filterText}
        setFilterText={setFilterText}
      />

      <div className="mt-4">
        <BankAccountsTable
          accounts={filteredAccounts}
          isLoading={isLoading}
          onEdit={(account) => {
            setEditingAccount(account);
            setIsDialogOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <BankAccountDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        account={editingAccount}
        onSubmit={(data) => {
          if (editingAccount) {
            handleUpdate(editingAccount.id, data);
          } else {
            handleCreate(data);
          }
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}
