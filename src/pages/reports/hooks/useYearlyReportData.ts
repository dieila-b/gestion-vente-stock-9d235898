
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

  // Fetch sales data
  const fetchSalesData = async () => {
    const startDate = startOfYear(new Date(parseInt(selectedYear)));
    const endDate = endOfYear(startDate);

    const query = supabase
      .from('orders')
      .select('created_at, final_total')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');

    if (selectedPOS !== "all") {
      query.eq('depot', selectedPOS);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Générer tous les mois de l'année
    const months = eachMonthOfInterval({
      start: startDate,
      end: endDate
    });

    // Initialiser les données avec 0 pour chaque mois
    const monthlyData: SalesData[] = months.map((month) => ({
      month: format(month, 'MMMM', { locale: fr }),
      sales: 0
    }));

    // Agréger les ventes par mois
    orders?.forEach((order) => {
      const orderMonth = format(new Date(order.created_at), 'MMMM', { locale: fr });
      const index = monthlyData.findIndex((data) => data.month === orderMonth);
      if (index !== -1) {
        monthlyData[index].sales += order.final_total;
      }
    });

    return monthlyData as SalesData[];
  };

  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['yearly-sales', selectedYear, selectedType, selectedPOS],
    queryFn: fetchSalesData
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
