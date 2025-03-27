
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CashRegisterHeader } from "@/components/cash-registers/CashRegisterHeader";
import { CashBalanceCards } from "@/components/cash-registers/CashBalanceCards";
import { TransactionForm } from "@/components/cash-registers/TransactionForm";
import { TransactionHistory } from "@/components/cash-registers/TransactionHistory";
import { useCashRegister } from "@/hooks/use-cash-register";
import { CashRegisterTransactionsPrintDialog } from "@/components/cash-registers/CashRegisterTransactionsPrintDialog";

export default function CashRegisters() {
  const { 
    cashRegister,
    transactions,
    expectedCashAmount,
    todayTotalSales,
    isLoading,
    isSubmitting,
    handleTransaction,
    refreshData
  } = useCashRegister();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-8 bg-black text-white">
        <CashRegisterHeader 
          onRefreshData={refreshData} 
          cashRegister={cashRegister}
        />

        <CashBalanceCards 
          currentAmount={expectedCashAmount}
          todayTotalSales={todayTotalSales}
          isLoading={isLoading}
        />

        <TransactionForm 
          onSubmit={handleTransaction}
          isSubmitting={isSubmitting}
        />

        <TransactionHistory 
          transactions={transactions}
          isLoading={isLoading}
        />
        
        <CashRegisterTransactionsPrintDialog 
          transactions={transactions}
          cashRegister={cashRegister}
        />
      </div>
    </DashboardLayout>
  );
}
