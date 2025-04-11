
import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export interface IncomeEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: Category;
}

export interface Category {
  id: string;
  name: string;
  type: string;
}

export function ExpenseIncomeTab() {
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['income-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_entries')
        .select(`
          *,
          category: expense_categories(*)
        `)
        .eq('type', 'income')
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
          type: "income"
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
          category: category
        } as IncomeEntry;
      });
      
      setIncomeEntries(mappedEntries);
    }
  }, [data]);

  // The rest of your component logic
  
  return (
    <Card>
      <CardContent className="p-6">
        {/* Your income entries UI */}
        <div>
          {isLoading && <p>Loading income entries...</p>}
          {error && <p>Error loading income entries: {error.message}</p>}
          {!isLoading && !error && incomeEntries.length === 0 && (
            <p>No income entries found</p>
          )}
          {incomeEntries.map(entry => (
            <div key={entry.id} className="mb-2 p-3 border rounded">
              <p><strong>Amount:</strong> {entry.amount}</p>
              <p><strong>Category:</strong> {entry.category.name}</p>
              <p><strong>Description:</strong> {entry.description}</p>
              <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
