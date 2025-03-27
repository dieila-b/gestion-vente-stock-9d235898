
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatGNF } from "@/lib/currency";
import { formatDateTime } from "@/lib/formatters";
import { ChevronLeft, ChevronRight, Printer, RefreshCw } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { useCashRegister } from "@/hooks/use-cash-register";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  created_at: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const printRef = useRef<HTMLDivElement>(null);
  const { filterTransactionsByDate, clearDateFilter, dateFilter, refreshData } = useCashRegister();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Historique des opérations de caisse",
    onAfterPrint: () => toast.success("Impression réussie"),
    onPrintError: () => toast.error("Erreur lors de l'impression"),
  });

  const formatTransactionDescription = (description: string) => {
    if (description.includes('Encaissement vente #')) {
      return "Encaissement Vente";
    } else if (description.includes('Précommande') || description.includes('précommande')) {
      return "Encaissement Précommande";
    }
    return description;
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleFilterByDate = () => {
    setCurrentPage(1);
    filterTransactionsByDate(selectedYear, selectedMonth);
    toast.success(`Affichage des transactions pour ${selectedMonth}/${selectedYear}`);
  };

  const handleResetFilter = () => {
    clearDateFilter();
    setCurrentPage(1);
    toast.success("Filtres réinitialisés");
  };

  const getMonthName = (monthNum: string) => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return months[parseInt(monthNum) - 1];
  };

  return (
    <Card className="p-6 bg-background border-none">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-purple-400">Historique des opérations de caisse</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => refreshData()}
              className="rounded-full p-2 border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handlePrint()}
              className="border-gray-700 hover:bg-gray-800"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] bg-black border-gray-700">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[120px] bg-black border-gray-700">
              <SelectValue placeholder="Mois">{getMonthName(selectedMonth)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString().padStart(2, '0');
                return (
                  <SelectItem key={month} value={month}>
                    {getMonthName(month)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button 
            className="bg-orange-500 hover:bg-orange-600 rounded-lg px-6 ml-auto"
            onClick={handleFilterByDate}
          >
            Valider
          </Button>
        </div>

        {dateFilter && (
          <div className="text-sm text-muted-foreground">
            Transactions pour {getMonthName(dateFilter.month)} {dateFilter.year}
          </div>
        )}

        <div ref={printRef} className="min-h-[300px]">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Chargement des opérations...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Aucune opération de caisse {dateFilter ? `pour ${getMonthName(dateFilter.month)} ${dateFilter.year}` : ''}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 font-medium text-sm px-3 text-muted-foreground">
                <div>Date</div>
                <div>Description</div>
                <div className="text-right">Montant</div>
              </div>
              {currentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="grid grid-cols-3 gap-4 p-3 glass-effect rounded-lg card-hover"
                >
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(transaction.created_at)}
                  </span>
                  <span>{formatTransactionDescription(transaction.description || (
                    transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'
                  ))}</span>
                  <span className={`text-right ${transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'deposit' ? '+' : '-'}{formatGNF(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {transactions.length > itemsPerPage && (
          <div className="flex items-center justify-center mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="glass-effect border-white/10 hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="glass-effect border-white/10 hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
