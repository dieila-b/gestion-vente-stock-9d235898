import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";

const data = [
  { name: "Électronique", value: 400 },
  { name: "Vêtements", value: 300 },
  { name: "Alimentation", value: 300 },
  { name: "Autres", value: 200 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

const config = {
  value: {
    theme: {
      light: "hsl(var(--primary))",
      dark: "hsl(var(--primary))",
    },
  },
};

export function CategoryChart() {
  return (
    <Card className="enhanced-glass p-6 chart-container animate-scale-in">
      <h2 className="text-lg font-semibold mb-4 text-gradient">Répartition par Catégorie</h2>
      <div className="h-[300px] w-full chart-3d">
        <ChartContainer config={config}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              className="animate-[spin_20s_linear_infinite]"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-opacity hover:scale-105 transform"
                />
              ))}
            </Pie>
            <ChartTooltip />
            <ChartLegend />
          </PieChart>
        </ChartContainer>
      </div>
    </Card>
  );
}