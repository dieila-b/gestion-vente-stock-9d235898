
import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError, safeGetProperty } from "@/utils/supabase-helpers";
import { Card, CardContent } from "@/components/ui/card";

export interface Category {
  id: string;
  name: string;
  type: string;
}

export interface OutcomeEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
  receipt_number?: string;
  payment_method?: string;
  status?: string;
  category: Category;
}

export function ExpenseOutcomeTab() {
  const [outcomeEntries, setOutcomeEntries] = useState<OutcomeEntry[]>([]);

  const { data: entriesData, isLoading, error } = useQuery({
    queryKey: ['outcome-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outcome_entries')
        .select(`
          *,
          category: expense_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (entriesData) {
      const mappedEntries: OutcomeEntry[] = entriesData.map((entry) => {
        // Create a default category in case we get a SelectQueryError
        const defaultCategory: Category = {
          id: "unknown",
          name: "Unknown Category",
          type: "expense"
        };

        // Handle potential SelectQueryError for category
        let entryCategory: Category;
        
        if (isSelectQueryError(entry.category)) {
          entryCategory = defaultCategory;
        } else {
          entryCategory = (entry.category as Category) || defaultCategory;
        }

        return {
          id: entry.id,
          amount: entry.amount,
          date: entry.created_at,
          description: entry.description,
          receipt_number: entry.receipt_number,
          payment_method: entry.payment_method,
          status: entry.status,
          category: entryCategory
        };
      });
      
      setOutcomeEntries(mappedEntries);
    }
  }, [entriesData]);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Your expense entries UI */}
        <div>
          {isLoading && <p>Loading expense entries...</p>}
          {error && <p>Error loading expense entries: {(error as Error).message}</p>}
          {!isLoading && !error && outcomeEntries.length === 0 && (
            <p>No expense entries found</p>
          )}
          {outcomeEntries.map(entry => (
            <div key={entry.id} className="mb-2 p-3 border rounded">
              <p><strong>Amount:</strong> {entry.amount}</p>
              <p><strong>Category:</strong> {entry.category.name}</p>
              <p><strong>Description:</strong> {entry.description}</p>
              <p><strong>Payment Method:</strong> {entry.payment_method || 'N/A'}</p>
              <p><strong>Receipt Number:</strong> {entry.receipt_number || 'N/A'}</p>
              <p><strong>Status:</strong> {entry.status || 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
