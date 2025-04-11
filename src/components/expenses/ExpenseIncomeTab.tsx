
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

export interface IncomeEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: Category;
}

export function ExpenseIncomeTab() {
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);

  const { data: entriesData, isLoading, error } = useQuery({
    queryKey: ['income-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_entries')
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
      const mappedEntries: IncomeEntry[] = entriesData.map((entry) => {
        // Create a default category in case we get a SelectQueryError
        const defaultCategory: Category = {
          id: "unknown",
          name: "Unknown Category",
          type: "income"
        };

        // Handle potential SelectQueryError for category by creating a safe category
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
          category: entryCategory
        };
      });
      
      setIncomeEntries(mappedEntries);
    }
  }, [entriesData]);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Your income entries UI */}
        <div>
          {isLoading && <p>Loading income entries...</p>}
          {error && <p>Error loading income entries: {(error as Error).message}</p>}
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
