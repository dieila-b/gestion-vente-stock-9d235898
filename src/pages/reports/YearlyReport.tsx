
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatGNF } from "@/lib/currency";

type SalesData = {
  month: string;
  sales: number;
}

type POSLocation = {
  id: string;
  name: string;
}

export default function YearlyReport() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedPOS, setSelectedPOS] = useState<string>("all");
  const [selectedType, setSelectedType] = useState("Par mois");

  // Récupérer la liste des points de vente
  const { data: posLocations = [] } = useQuery<POSLocation[]>({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Fix the type instantiation issue by explicitly typing the query result
  const { data: salesData = [], isLoading } = useQuery<SalesData[]>({
    queryKey: ['yearly-sales', selectedYear, selectedType, selectedPOS],
    queryFn: async () => {
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

      return monthlyData;
    }
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => (currentYear - 2 + i).toString()
  );

  const reportTypes = ["Par mois"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Synthèse Annuelle</h1>
        <p className="text-sm text-muted-foreground">
          Les marges indiquées ci-dessous sont calculées sur la base d'un PRMP (Prix de Revient Moyen Pondéré)
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-64">
          <label className="block text-sm font-medium mb-2">Point de vente</label>
          <Select value={selectedPOS} onValueChange={setSelectedPOS}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un point de vente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les PDV</SelectItem>
              {posLocations.map((pos) => (
                <SelectItem key={pos.id} value={pos.id}>
                  {pos.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <label className="block text-sm font-medium mb-2">Année</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une année" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <label className="block text-sm font-medium mb-2">Type</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-orange-500 hover:bg-orange-600">
          Valider
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white/5">
          <div className="text-sm text-muted-foreground">Ventes</div>
          <div className="text-2xl font-bold">1</div>
        </div>
        <div className="p-4 rounded-lg bg-white/5">
          <div className="text-sm text-muted-foreground">CA</div>
          <div className="text-2xl font-bold">{formatGNF(11750000)}</div>
        </div>
        <div className="p-4 rounded-lg bg-white/5">
          <div className="text-sm text-muted-foreground">Produits</div>
          <div className="text-2xl font-bold">50</div>
        </div>
        <div className="p-4 rounded-lg bg-white/5">
          <div className="text-sm text-muted-foreground">% marge</div>
          <div className="text-2xl font-bold">40.43%</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Chiffre d'affaires</h2>
        <div className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Chargement...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                />
                <YAxis 
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip 
                  formatter={(value: number) => formatGNF(value)}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  dot={false}
                  name="Ventes"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
