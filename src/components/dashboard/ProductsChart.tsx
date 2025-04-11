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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { unwrapSupabaseObject, transformSupabaseResponse } from "@/utils/supabase-helpers";

export function ProductsChart() {
  const { data: stockData, isLoading } = useQuery({
    queryKey: ['top-combined-stock-products'],
    queryFn: async () => {
      console.log("Fetching combined stock data...");
      
      // Récupérer tous les stocks (entrepôts et points de vente)
      const { data: stockData, error } = await supabase
        .from('warehouse_stock')
        .select(`
          quantity,
          product:catalog(
            id,
            name
          )
        `);

      if (error) throw error;

      // Agréger les quantités par produit
      const combinedStock = stockData.reduce((acc, item) => {
        const product = unwrapSupabaseObject(item.product);
        if (!product?.name) return acc;
        
        const existingProduct = acc.find(p => p.name === product.name);
        if (existingProduct) {
          existingProduct.value += item.quantity;
        } else {
          acc.push({
            name: product.name,
            value: item.quantity
          });
        }
        return acc;
      }, [] as { name: string; value: number }[]);

      // Trier par quantité totale et prendre les 5 premiers
      const topProducts = combinedStock
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      console.log("Top 5 products by stock:", topProducts);
      return topProducts;
    }
  });

  if (isLoading) {
    return (
      <Card className="enhanced-glass p-6 chart-container animate-scale-in">
        <h2 className="text-lg font-semibold mb-4 text-gradient">Top Produits en Stock</h2>
        <div className="h-[300px] w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!stockData?.length) {
    return (
      <Card className="enhanced-glass p-6 chart-container animate-scale-in">
        <h2 className="text-lg font-semibold mb-4 text-gradient">Top Produits en Stock</h2>
        <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
          Aucun produit trouvé
        </div>
      </Card>
    );
  }

  return (
    <Card className="enhanced-glass p-6 chart-container animate-scale-in">
      <h2 className="text-lg font-semibold mb-4 text-gradient">Top Produits en Stock</h2>
      <div className="h-[300px] w-full chart-3d">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              className="fill-primary/80 hover:fill-primary transition-colors animate-slide-in"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
