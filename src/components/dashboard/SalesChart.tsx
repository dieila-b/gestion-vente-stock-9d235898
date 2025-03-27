
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { subDays, subMonths, subYears, format, parseISO, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { formatGNF } from "@/lib/currency";

type PeriodOption = "1m" | "3m" | "6m" | "1y";

const periods: Record<PeriodOption, { label: string; getDates: () => { start: Date; end: Date } }> = {
  "1m": {
    label: "1 mois",
    getDates: () => ({
      start: startOfDay(subMonths(new Date(), 1)),
      end: new Date()
    })
  },
  "3m": {
    label: "3 mois",
    getDates: () => ({
      start: startOfDay(subMonths(new Date(), 3)),
      end: new Date()
    })
  },
  "6m": {
    label: "6 mois",
    getDates: () => ({
      start: startOfDay(subMonths(new Date(), 6)),
      end: new Date()
    })
  },
  "1y": {
    label: "1 an",
    getDates: () => ({
      start: startOfDay(subYears(new Date(), 1)),
      end: new Date()
    })
  }
};

export function SalesChart() {
  const [period, setPeriod] = useState<PeriodOption>("1m");

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-evolution', period],
    queryFn: async () => {
      const { start, end } = periods[period].getDates();
      
      // Récupérer les ventes de la période
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, final_total')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');

      if (error) {
        console.error('Error fetching sales data:', error);
        throw error;
      }

      // Agréger les ventes par jour
      const dailySales = orders?.reduce((acc, order) => {
        const date = format(parseISO(order.created_at), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + (order.final_total || 0);
        return acc;
      }, {} as Record<string, number>);

      // Créer un tableau de données pour le graphique
      const chartData = Object.entries(dailySales || {}).map(([date, total]) => ({
        date: format(parseISO(date), 'dd MMM', { locale: fr }),
        sales: total
      }));

      return chartData;
    }
  });

  const handleDownloadCSV = () => {
    if (!salesData) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Ventes\n"
      + salesData.map(row => `${row.date},${row.sales}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ventes-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="enhanced-glass p-6 chart-container animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gradient">Évolution des Ventes</h2>
        <div className="flex gap-2">
          <div className="flex rounded-md overflow-hidden">
            {(Object.keys(periods) as PeriodOption[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm transition-colors ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownloadCSV}
            className="ml-2"
            disabled={!salesData?.length}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="h-[300px] w-full chart-3d">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !salesData?.length ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            Aucune donnée pour la période sélectionnée
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={8}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-background/95 border border-border p-2 rounded-lg shadow-lg">
                      <p className="text-sm font-medium">{payload[0].payload.date}</p>
                      <p className="text-sm text-muted-foreground">
                        Ventes: {formatGNF(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                name="Ventes"
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4, className: "fill-primary animate-pulse" }}
                className="stroke-primary"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
