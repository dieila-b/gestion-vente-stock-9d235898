
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpFromLine, ArrowDownToLine, History, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatGNF } from "@/lib/currency";

interface CashRegisterCardProps {
  register: any;
  onTransaction: (register: any, type: 'deposit' | 'withdrawal') => void;
}

export function CashRegisterCard({ register, onTransaction }: CashRegisterCardProps) {
  const { data: transactions } = useQuery({
    queryKey: ['transactions', register.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_register_transactions')
        .select('*')
        .eq('cash_register_id', register.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="p-6 enhanced-glass transform transition-all duration-300 hover:scale-105">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gradient">{register.name}</h3>
          <div className="text-lg font-medium text-muted-foreground">
            Solde actuel: {formatGNF(register.current_amount)}
          </div>
          <div className="text-sm text-muted-foreground">
            Montant initial: {formatGNF(register.initial_amount)}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 enhanced-glass hover:bg-green-500/10"
            onClick={() => onTransaction(register, 'deposit')}
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Dépôt
          </Button>
          <Button 
            className="flex-1 enhanced-glass hover:bg-red-500/10"
            onClick={() => onTransaction(register, 'withdrawal')}
          >
            <ArrowUpFromLine className="mr-2 h-4 w-4" />
            Retrait
          </Button>
        </div>

        {transactions && (
          <div className="mt-4 space-y-2 w-full">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                <History className="mr-2 h-4 w-4" />
                Dernières transactions
              </h4>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                <span className="mr-1">Voir plus</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 min-w-[400px]">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="text-sm text-muted-foreground flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                  <span>{transaction.description || (transaction.type === 'deposit' ? 'Dépôt' : 'Retrait')}</span>
                  <span className={transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'}>
                    {transaction.type === 'deposit' ? '+' : '-'}{formatGNF(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
