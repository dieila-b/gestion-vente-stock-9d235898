
import { Store } from "lucide-react";
import { Card } from "@/components/ui/card";

interface POSLocationStatsProps {
  totalPOSLocations: number;
  totalPOSSurface: number;
  averagePOSOccupancyRate: number;
}

export function POSLocationStats({ 
  totalPOSLocations, 
  totalPOSSurface, 
  averagePOSOccupancyRate 
}: POSLocationStatsProps) {
  // Ensure we have a valid number for the average rate
  const displayRate = isNaN(averagePOSOccupancyRate) ? 0 : Math.round(averagePOSOccupancyRate);
  
  // Log the stats for debugging
  console.log("POSLocationStats values:", {
    totalPOSLocations,
    totalPOSSurface,
    averagePOSOccupancyRate,
    displayRate
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 enhanced-glass">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total PDV</p>
            <h2 className="text-3xl font-bold">{totalPOSLocations}</h2>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Store className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="mt-4 text-sm text-green-500">↑ 2.0%</div>
      </Card>

      <Card className="p-6 enhanced-glass">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Surface Totale</p>
            <h2 className="text-3xl font-bold">{totalPOSSurface.toLocaleString()} m²</h2>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 22H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 22V11H11V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 22V6H21V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 11V7H9V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 6V2H19V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="mt-4 text-sm text-green-500">↑ 15.0%</div>
      </Card>

      <Card className="p-6 enhanced-glass">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Taux Occupation Moyen</p>
            <h2 className="text-3xl font-bold">{displayRate} %</h2>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="mt-4 text-sm text-green-500">↑ 5.0%</div>
      </Card>
    </div>
  );
}
