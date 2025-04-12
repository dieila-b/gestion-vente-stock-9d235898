
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POSLocation } from "@/types/pos-locations";

interface YearlyReportFiltersProps {
  posLocations: POSLocation[];
  selectedPOS: string;
  setSelectedPOS: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  years: string[];
  reportTypes: string[];
}

export function YearlyReportFilters({
  posLocations,
  selectedPOS,
  setSelectedPOS,
  selectedYear,
  setSelectedYear,
  selectedType,
  setSelectedType,
  years,
  reportTypes
}: YearlyReportFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="w-64">
        <label className="block text-sm font-medium mb-2">Point de vente</label>
        <Select value={selectedPOS} onValueChange={setSelectedPOS}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un point de vente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les PDV</SelectItem>
            {posLocations.map((pos) => (
              <SelectItem key={pos.id} value={pos.id}>
                {pos.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-64">
        <label className="block text-sm font-medium mb-2">Année</label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une année" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-64">
        <label className="block text-sm font-medium mb-2">Type</label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            {reportTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="bg-orange-500 hover:bg-orange-600">
        Valider
      </Button>
    </div>
  );
}
