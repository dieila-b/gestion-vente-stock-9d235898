
import { useYearlyReportData } from "./hooks/useYearlyReportData";
import { YearlyReportFilters } from "./components/YearlyReportFilters";
import { YearlyReportStats } from "./components/YearlyReportStats";
import { YearlySalesChart } from "./components/YearlySalesChart";

export default function YearlyReport() {
  const {
    selectedYear,
    setSelectedYear,
    selectedPOS,
    setSelectedPOS,
    selectedType,
    setSelectedType,
    posLocations,
    salesData,
    isLoading,
    years,
    reportTypes
  } = useYearlyReportData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Synthèse Annuelle</h1>
        <p className="text-sm text-muted-foreground">
          Les marges indiquées ci-dessous sont calculées sur la base d'un PRMP (Prix de Revient Moyen Pondéré)
        </p>
      </div>

      <YearlyReportFilters
        posLocations={posLocations}
        selectedPOS={selectedPOS}
        setSelectedPOS={setSelectedPOS}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        years={years}
        reportTypes={reportTypes}
      />

      <YearlyReportStats />

      <YearlySalesChart 
        salesData={salesData}
        isLoading={isLoading}
      />
    </div>
  );
}
