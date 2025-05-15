
import { useState } from "react";
import { StockEntryForm } from "../useStockMovementTypes";
import { useStockEntryMutation } from "./use-stock-entry-mutation";
import { UseStockEntriesReturn } from "./types";

export function useStockEntries(): UseStockEntriesReturn {
  const { createStockEntryMutation, isLoading: mutationLoading } = useStockEntryMutation();
  const [isLoading, setIsLoading] = useState(false);

  const createStockEntry = async (data: StockEntryForm): Promise<boolean> => {
    try {
      console.log("Creating stock entry via mutation with data:", data);
      setIsLoading(true);
      await createStockEntryMutation.mutateAsync(data);
      return true;
    } catch (error) {
      console.error("Error in createStockEntry wrapper:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createStockEntry,
    isLoading: isLoading || mutationLoading || createStockEntryMutation.isPending,
  };
}
