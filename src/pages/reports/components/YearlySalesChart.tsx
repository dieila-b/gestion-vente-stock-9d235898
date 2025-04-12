
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatGNF } from "@/lib/currency";
import { SalesData } from "../hooks/useYearlyReportData";

interface YearlySalesChartProps {
  salesData: SalesData[];
  isLoading: boolean;
}

export function YearlySalesChart({ salesData, isLoading }: YearlySalesChartProps) {
  return (
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
  );
}
