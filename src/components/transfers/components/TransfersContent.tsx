
import { Card } from "@/components/ui/card";
import { SearchTransfer } from "@/components/transfers/SearchTransfer";
import { TransferList } from "@/components/transfers/TransferList";
import { Transfer } from "@/types/transfer";

interface TransfersContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredTransfers: Transfer[];
  onEdit: (transfer: Transfer) => void;
  onDelete: (transferId: string) => void;
}

export const TransfersContent = ({
  searchQuery,
  onSearchChange,
  filteredTransfers,
  onEdit,
  onDelete
}: TransfersContentProps) => {
  return (
    <Card className="enhanced-glass p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Liste des Transferts
        </h2>
        <SearchTransfer 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </div>

      <TransferList
        transfers={filteredTransfers}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Card>
  );
};
