
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TransactionFormProps {
  onSubmit: (type: 'deposit' | 'withdrawal', amount: string, description: string) => Promise<void>;
  isSubmitting: boolean;
}

export function TransactionForm({ onSubmit, isSubmitting }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('withdrawal');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(transactionType, amount, description);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Retrait / Dépôt</h2>
        </div>
        
        <Select 
          value={transactionType} 
          onValueChange={(value: 'deposit' | 'withdrawal') => setTransactionType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="withdrawal">Retrait</SelectItem>
            <SelectItem value="deposit">Dépôt</SelectItem>
          </SelectContent>
        </Select>

        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Montant Retrait / Dépôt"
          type="number"
          step="0.01"
          required
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Commentaires"
        />

        <Button 
          type="submit" 
          className="w-full bg-orange-500 hover:bg-orange-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Traitement...' : 'Sauvegarder'}
        </Button>
      </form>
    </Card>
  );
}
