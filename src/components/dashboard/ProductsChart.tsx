
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const data = [
  { name: "Laptop Dell XPS", value: 4500 },
  { name: "Macbook Pro", value: 3200 },
  { name: "Imprimante HP", value: 2800 },
  { name: "Samsung Galaxy", value: 2100 },
  { name: "Écran Samsung", value: 1700 },
];

export function ProductsChart() {
  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30">
      <h2 className="text-lg font-semibold mb-4 text-purple-400">Top Produits en Stock</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <ChartTooltip />
            <Bar
              dataKey="value"
              name="Quantité en Stock"
              radius={[4, 4, 0, 0]}
              fill="#9b87f5"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
