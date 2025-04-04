
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const data = [
  { name: "Jan", value: 140.0 },
  { name: "Feb", value: 115.0 },
  { name: "Mar", value: 95.0 },
  { name: "Apr", value: 78.0 },
  { name: "May", value: 63.0 },
  { name: "Jun", value: 82.0 },
  { name: "Jul", value: 97.0 },
];

export function SalesChart() {
  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30">
      <h2 className="text-lg font-semibold mb-4 text-purple-400">Évolution des Ventes</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              width={40}
              unit="M"
              tickFormatter={(value) => `${value}`} 
            />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="value"
              name="Ventes"
              stroke="#9b87f5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex mt-4 space-x-2">
        <button className="px-3 py-1 bg-purple-500/80 rounded-md text-xs font-medium">1m</button>
        <button className="px-3 py-1 bg-gray-700/50 rounded-md text-xs font-medium">3m</button>
        <button className="px-3 py-1 bg-gray-700/50 rounded-md text-xs font-medium">6m</button>
        <button className="px-3 py-1 bg-gray-700/50 rounded-md text-xs font-medium">1y</button>
      </div>
    </Card>
  );
}
