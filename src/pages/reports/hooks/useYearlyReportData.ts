
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { POSLocation } from "@/types/pos-locations";

export type SalesData = {
  month: string;
  sales: number;
}

// Define the return type for the orders query
type OrderData = {
  created_at: string;
  final_total: number;
}

// Define fetch function completely outside the hook to avoid type inference issues
async function fetchSalesData(
  selectedYear: string,
  selectedPOS: string
): Promise<SalesData[]> {
  const startDate = startOfYear(new Date(parseInt(selectedYear)));
  const endDate = endOfYear(startDate);

  try {
    // Create a regular query builder first
    const queryBuilder = supabase
      .from('orders')
      .select('created_at, final_total');
    
    // Add date range filters
    const dateFilteredQuery = queryBuilder
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    // Add POS filter if needed
    let finalQuery = dateFilteredQuery;
    if (selectedPOS !== "all") {
      finalQuery = dateFilteredQuery.eq('depot', selectedPOS);
    }
    
    // Execute the query with an explicit type annotation
    const { data, error } = await finalQuery.order('created_at') as { 
      data: OrderData[] | null; 
      error: Error | null 
    };
    
    if (error) throw error;
    
    if (!data) return [];

    // Generate all months of the year
    const months = eachMonthOfInterval({
      start: startDate,
      end: endDate
    });

    // Initialize data with 0 for each month
    const monthlyData: SalesData[] = months.map((month) => ({
      month: format(month, 'MMMM', { locale: fr }),
      sales: 0
    }));

    // Aggregate sales by month
    data.forEach((order: OrderData) => {
      const orderMonth = format(new Date(order.created_at), 'MMMM', { locale: fr });
      const index = monthlyData.findIndex((data) => data.month === orderMonth);
      if (index !== -1) {
        monthlyData[index].sales += order.final_total;
      }
    });

    return monthlyData;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return [];
  }
}

export function useYearlyReportData() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedPOS, setSelectedPOS] = useState<string>("all");
  const [selectedType, setSelectedType] = useState("Par mois");

  // Récupérer la liste des points de vente
  const { data: posLocations = [] } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data as POSLocation[];
    }
  });

  // Use the explicit return type for the useQuery and pass parameters to the external fetch function
  const { data: salesData = [], isLoading } = useQuery<SalesData[], Error>({
    queryKey: ['yearly-sales', selectedYear, selectedType, selectedPOS],
    queryFn: () => fetchSalesData(selectedYear, selectedPOS)
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => (currentYear - 2 + i).toString()
  );

  const reportTypes = ["Par mois"];

  return {
    selectedYear,
    setSelectedYear,
    selectedPOS,
    setSelectedPOS,
    selectedType,
    setSelectedType,
    posLocations,
    salesData,
    isLoading,
    years,
    reportTypes
  };
}
