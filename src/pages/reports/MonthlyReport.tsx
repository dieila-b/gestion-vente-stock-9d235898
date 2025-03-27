
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { addMonths, format, startOfMonth, endOfMonth, eachHourOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatGNF } from "@/lib/currency";

type SalesData = {
  hour: number;
  sales: number;
}

type POSLocation = {
  id: string;
  name: string;
}

export default function MonthlyReport() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM', { locale: fr }));
  const [selectedPOS, setSelectedPOS] = useState<string>("all");
  const [selectedType, setSelectedType] = useState("Par heure");

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

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['monthly-sales', selectedYear, selectedMonth, selectedType, selectedPOS],
    queryFn: async () => {
      const monthIndex = new Date(Date.parse(`${selectedMonth} 1, ${selectedYear}`)).getMonth();
      const startDate = startOfMonth(new Date(parseInt(selectedYear), monthIndex));
      const endDate = endOfMonth(startDate);

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

      // Générer toutes les heures du mois
      const hours = eachHourOfInterval({
        start: startDate,
        end: endDate
      });

      // Initialiser les données avec 0 pour chaque heure
      const hourlyData: SalesData[] = hours.map((hour) => ({
        hour: hour.getHours(),
        sales: 0
      }));

      // Agréger les ventes par heure
      orders?.forEach((order) => {
        const orderHour = new Date(order.created_at).getHours();
        const index = hourlyData.findIndex((data) => data.hour === orderHour);
        if (index !== -1) {
          hourlyData[index].sales += order.final_total;
        }
      });

      return hourlyData;
    }
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => (currentYear - 2 + i).toString()
  );

  const months = Array.from(
    { length: 12 },
    (_, i) => format(addMonths(new Date(2024, 0, 1), i), 'MMMM', { locale: fr })
  );

  const reportTypes = ["Par heure", "Par jour", "Par semaine", "Par mois"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Synthèse Mensuelle</h1>
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
          <label className="block text-sm font-medium mb-2">Mois</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un mois" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
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
                  dataKey="hour"
                  tickFormatter={(hour) => `${hour}h`}
                />
                <YAxis 
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip 
                  formatter={(value: number) => formatGNF(value)}
                  labelFormatter={(hour) => `${hour}h`}
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

