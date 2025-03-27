import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStockStats } from "@/hooks/dashboard/useStockStats";
import { useWarehouseDistribution } from "@/hooks/dashboard/useWarehouseDistribution";
import { useCategoryDistribution } from "@/hooks/dashboard/useCategoryDistribution";
import { useStockAlerts } from "@/hooks/dashboard/useStockAlerts";
import { formatGNF } from "@/lib/currency";
import { CircleDollarSign, History, Package, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { StockAlertsList } from "@/components/stocks/StockAlertsList";
import { RecentMovements } from "@/components/stocks/RecentMovements";

// Couleurs pour le graphique
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#6BCB77', '#4D96FF'];

export default function StockStatus() {
  const [activeTab, setActiveTab] = useState("apercu");
  const { totalStock, totalStockPurchaseValue, totalStockSaleValue, globalStockMargin, marginPercentage } = useStockStats();
  const { data: warehouseDistribution, isLoading: isLoadingDistribution } = useWarehouseDistribution();
  const { data: categoryDistribution, isLoading: isLoadingCategories } = useCategoryDistribution();
  const { data: stockAlerts, isLoading: isLoadingAlerts } = useStockAlerts();
  
  // État pour gérer le secteur actif dans le graphique des entrepôts
  const [activeWarehouseIndex, setActiveWarehouseIndex] = useState(0);
  // État pour gérer le secteur actif dans le graphique des catégories
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Fonction pour gérer le survol des secteurs (entrepôts)
  const onWarehousePieEnter = (_: any, index: number) => {
    setActiveWarehouseIndex(index);
  };

  // Fonction pour gérer le survol des secteurs (catégories)
  const onCategoryPieEnter = (_: any, index: number) => {
    setActiveCategoryIndex(index);
  };

  // Rendu du secteur actif (avec effet de survol)
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#999">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#999">
          {`${value} unités`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">État des Stocks</h1>
        <p className="text-muted-foreground">
          Visualisez l'état actuel de vos stocks et leur valorisation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="apercu">Aperçu Général</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="mouvements">Mouvements Récents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apercu" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="enhanced-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quantité Totale
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Articles en stock
                </p>
              </CardContent>
            </Card>
            
            <Card className="enhanced-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valeur d'Achat
                </CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatGNF(totalStockPurchaseValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Coût total des stocks
                </p>
              </CardContent>
            </Card>
            
            <Card className="enhanced-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valeur de Vente
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatGNF(totalStockSaleValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Valeur potentielle de vente
                </p>
              </CardContent>
            </Card>
            
            <Card className="enhanced-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Marge Potentielle
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-baseline">
                  {formatGNF(globalStockMargin)}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({marginPercentage.toFixed(2)}%)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Profit potentiel sur les stocks
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="enhanced-glass">
              <CardHeader>
                <CardTitle>Répartition par Entrepôt</CardTitle>
                <CardDescription>
                  Distribution des stocks par emplacement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoadingDistribution ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Données en cours de chargement...</p>
                    </div>
                  ) : warehouseDistribution && warehouseDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activeWarehouseIndex}
                          activeShape={renderActiveShape}
                          data={warehouseDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          onMouseEnter={onWarehousePieEnter}
                        >
                          {warehouseDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="enhanced-glass">
              <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
                <CardDescription>
                  Distribution des stocks par catégorie de produits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoadingCategories ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Données en cours de chargement...</p>
                    </div>
                  ) : categoryDistribution && categoryDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activeCategoryIndex}
                          activeShape={renderActiveShape}
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          onMouseEnter={onCategoryPieEnter}
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts">
          <Card className="enhanced-glass">
            <CardHeader>
              <CardTitle>Alertes de Stock</CardTitle>
              <CardDescription>
                Produits en rupture ou en stock faible nécessitant votre attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockAlertsList alerts={stockAlerts || []} isLoading={isLoadingAlerts} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mouvements">
          <Card className="enhanced-glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle>Mouvements Récents</CardTitle>
              </div>
              <CardDescription>
                Historique des dernières transactions de stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentMovements />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
