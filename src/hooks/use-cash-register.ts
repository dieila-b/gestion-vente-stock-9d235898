import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchLatestCashRegister, 
  fetchCashRegisterTransactions,
  fetchCashRegisterTransactionsByDate,
  fetchTodaySalesData,
  addCashRegisterTransaction
} from "@/api/cash-register-api";
import { calculateTodayTotalSales, calculateExpectedCashAmount } from "@/utils/cash-register-utils";
import { CashRegister, Transaction, TodaySales } from "@/types/cash-register";

export function useCashRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ year: string; month: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: cashRegister, isLoading: isLoadingCashRegister } = useQuery<CashRegister | null>({
    queryKey: ['cashRegisters'],
    queryFn: fetchLatestCashRegister,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const { data: todaySales, isLoading: isLoadingSales } = useQuery<TodaySales>({
    queryKey: ['todaySales'],
    queryFn: fetchTodaySalesData,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', cashRegister?.id, dateFilter],
    queryFn: () => {
      if (!cashRegister?.id) return [];
      
      if (dateFilter) {
        return fetchCashRegisterTransactionsByDate(
          cashRegister.id, 
          dateFilter.year, 
          dateFilter.month
        );
      }
      
      return fetchCashRegisterTransactions(cashRegister.id);
    },
    enabled: !!cashRegister?.id,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const expectedCashAmount = cashRegister ? 
    calculateExpectedCashAmount(cashRegister.initial_amount || cashRegister.current_amount, transactions) : 0;

  const handleTransaction = async (type: 'deposit' | 'withdrawal', amount: string, description: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!cashRegister?.id) {
        toast.error("Aucune caisse active trouvée");
        return;
      }
      
      const amountValue = parseFloat(amount);
      
      console.log('Starting transaction:', { type, amount: amountValue, description });
      
      await addCashRegisterTransaction(
        cashRegister.id,
        type,
        amountValue,
        description || (type === 'deposit' ? 'Dépôt' : 'Retrait')
      );
      
      toast.success(`${type === 'deposit' ? 'Dépôt' : 'Retrait'} enregistré avec succès`);
      
      await refreshData();
    } catch (error) {
      console.error('Error in handleTransaction:', error);
      toast.error("Une erreur est survenue lors de la transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshData = async () => {
    try {
      console.log('Refreshing cash register data');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cashRegisters'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['todaySales'] })
      ]);
      console.log('Cash register data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing cash register data:', error);
      toast.error("Erreur lors du rafraîchissement des données");
    }
  };

  const filterTransactionsByDate = (year: string, month: string) => {
    setDateFilter({ year, month });
  };

  const clearDateFilter = () => {
    setDateFilter(null);
  };

  return {
    cashRegister,
    transactions,
    expectedCashAmount,
    todayTotalSales: calculateTodayTotalSales(todaySales),
    isLoading: isLoadingCashRegister || isLoadingSales || isLoadingTransactions,
    isSubmitting,
    handleTransaction,
    refreshData,
    filterTransactionsByDate,
    clearDateFilter,
    dateFilter
  };
}
