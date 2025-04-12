
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDailyReportQueries } from "./hooks/useDailyReportQueries";
import { DailyProductSales as DailyProductSalesComponent } from "./components/DailyProductSales";
import { DailyClientSales as DailyClientSalesComponent } from "./components/DailyClientSales";
import { SalesTotals } from "./components/SalesTotals";

export default function DailyReport() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { 
    dailySales, 
    dailyExpenses, 
    dailyPayments, 
    periodTotals, 
    dailyProducts, 
    dailyClients,
    isLoadingSales,
    isLoadingExpenses,
    isLoadingPayments
  } = useDailyReportQueries(selectedDate);

  // Define loading state based on all loading states
  const isLoading = isLoadingSales || isLoadingExpenses || isLoadingPayments;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Rapport Journalier</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Sélectionnez une date</h2>
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <p className="mt-4 text-center font-medium">
              {selectedDate
                ? format(selectedDate, "EEEE dd MMMM yyyy", { locale: require('date-fns/locale/fr') })
                : "Aucune date sélectionnée"}
            </p>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <SalesTotals periodTotals={periodTotals} />

            <DailyProductSalesComponent 
              salesByProduct={dailyProducts} 
              isLoading={isLoading} 
            />

            <DailyClientSalesComponent 
              clientSales={dailyClients} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
