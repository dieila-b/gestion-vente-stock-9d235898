
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { TransactionFilters } from "./transaction-history/TransactionFilters";
import { TransactionTable } from "./transaction-history/TransactionTable";
import { TransactionPagination } from "./transaction-history/TransactionPagination";
import { EditTransactionDialog } from "./transaction-history/EditTransactionDialog";
import { DeleteTransactionDialog } from "./transaction-history/DeleteTransactionDialog";

interface TransactionHistoryProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionHistory({ open, onClose }: TransactionHistoryProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { updateOrderMutation, deleteOrderMutation } = useOrders();

  const getFilterDate = () => {
    const now = new Date();
    switch (filter) {
      case "today":
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case "week":
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        return lastWeek.toISOString();
      case "month":
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        return lastMonth.toISOString();
      default:
        return null;
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', page, search, filter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (search) {
        query = query.ilike('id', `%${search}%`);
      }

      const filterDate = getFilterDate();
      if (filterDate) {
        query = query.gte('created_at', filterDate);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        transactions: data,
        total: count || 0
      };
    }
  });

  const totalPages = data ? Math.ceil(data.total / itemsPerPage) : 0;

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;

    await updateOrderMutation.mutateAsync({
      id: editingTransaction.id,
      discount: parseFloat(editingTransaction.discount),
      status: editingTransaction.status
    });

    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteOrderMutation.mutateAsync(id);
      setDeleteConfirm(null);
      await refetch();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Force close all dialogs when parent dialog closes
  const handleParentDialogClose = () => {
    setDeleteConfirm(null);
    setEditingTransaction(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleParentDialogClose()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Historique des Transactions</DialogTitle>
          </DialogHeader>

          <TransactionFilters
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
          />

          <TransactionTable
            transactions={data?.transactions || []}
            isLoading={isLoading || deleteOrderMutation.isPending}
            onEdit={setEditingTransaction}
            onDelete={(id) => setDeleteConfirm(id)}
          />

          <TransactionPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={data?.total || 0}
            onPageChange={setPage}
          />
        </DialogContent>
      </Dialog>

      <EditTransactionDialog
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdateTransaction}
        isLoading={updateOrderMutation.isPending}
        onDiscountChange={(value) => setEditingTransaction({
          ...editingTransaction,
          discount: value
        })}
        onStatusChange={(value) => setEditingTransaction({
          ...editingTransaction,
          status: value
        })}
      />

      <DeleteTransactionDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteTransaction(deleteConfirm)}
      />
    </>
  );
}
