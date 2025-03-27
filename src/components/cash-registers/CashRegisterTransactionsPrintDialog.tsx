
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatGNF } from "@/lib/currency";
import { formatDate } from "@/lib/formatters";
import { Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { CashRegister, Transaction } from "@/types/cash-register";

interface Props {
  transactions: Transaction[];
  cashRegister: CashRegister | null;
}

export function CashRegisterTransactionsPrintDialog({ transactions, cashRegister }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Historique des opérations de caisse',
    pageStyle: `
      @media print {
        @page {
          margin: 20mm;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
    onAfterPrint: () => {
      toast.success("Impression réussie !");
    },
    onPrintError: () => {
      toast.error("Erreur lors de l'impression");
    },
  });

  const onPrintClick = () => {
    if (handlePrint) {
      handlePrint();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer l'historique
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[800px]">
        <DialogHeader>
          <DialogTitle>Imprimer l'historique des opérations</DialogTitle>
          <DialogDescription>
            Aperçu avant impression
          </DialogDescription>
        </DialogHeader>

        <div ref={printRef} className="p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Historique des opérations de caisse</h2>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString()}
            </p>
            {cashRegister && (
              <p className="text-muted-foreground">
                Solde actuel: {formatGNF(cashRegister.current_amount)}
              </p>
            )}
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-right">Type</th>
                <th className="py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b">
                  <td className="py-2">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="py-2">
                    {transaction.type === 'deposit' ? 'Encaissement Vente' : transaction.description}
                  </td>
                  <td className="py-2 text-right">
                    {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                  </td>
                  <td className={`py-2 text-right ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatGNF(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button onClick={onPrintClick}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
