
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, ShoppingBag, Warehouse, ArrowUpDown } from "lucide-react"; // Changed 'Buildings' to 'Building'
import { 
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface StockLocationsData {
  data: {
    name: string;
    value: number;
    type: "warehouse" | "pos";
  }[];
  isLoading: boolean;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

export function StockLocationStats({ data, isLoading }: StockLocationsData) {
  // Separate warehouses and POS
  const warehouseData = data.filter(item => item.type === "warehouse");
  const posData = data.filter(item => item.type === "pos");

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 border border-border p-3 rounded-md shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {`Quantité : ${payload[0].value.toLocaleString()}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`${(payload[0].payload.percent * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="enhanced-glass">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">
            Entrepôts
          </CardTitle>
          <Warehouse className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <p>Chargement des données...</p>
            </div>
          ) : warehouseData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center">
              <p>Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={warehouseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {warehouseData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="enhanced-glass">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">
            Points de Vente
          </CardTitle>
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <p>Chargement des données...</p>
            </div>
          ) : posData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center">
              <p>Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={posData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {posData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
