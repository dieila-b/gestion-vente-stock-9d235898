import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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

export interface Category {
  id: string;
  name: string;
  type: string;
}

export function ExpenseOutcomeTab() {
  const [outcomeEntries, setOutcomeEntries] = useState<OutcomeEntry[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['outcome-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outcome_entries')
        .select(`
          *,
          category: expense_categories(*)
        `)
        .eq('type', 'expense')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (data) {
      const mappedEntries = data.map((entry) => {
        // Create a default category in case we get a SelectQueryError
        const defaultCategory: Category = {
          id: "unknown",
          name: "Unknown Category",
          type: "expense"
        };

        // Handle potential SelectQueryError for category
        const category = isSelectQueryError(entry.category) 
          ? defaultCategory 
          : entry.category || defaultCategory;

        return {
          id: entry.id,
          amount: entry.amount,
          date: entry.created_at,
          description: entry.description,
          receipt_number: entry.receipt_number,
          payment_method: entry.payment_method,
          status: entry.status,
          category: category
        } as OutcomeEntry;
      });
      
      setOutcomeEntries(mappedEntries);
    }
  }, [data]);

  // The rest of your component logic
  
  return (
    <Card>
      <CardContent className="p-6">
        {/* Your expense entries UI */}
        <div>
          {isLoading && <p>Loading expense entries...</p>}
          {error && <p>Error loading expense entries: {error.message}</p>}
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
