
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SupplierList } from "./SupplierList";
import { SupplierValidationList } from "./SupplierValidationList";
import { SupplierPerformanceList } from "./SupplierPerformanceList";
import type { Supplier } from "@/types/supplier";

interface SupplierTabsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  suppliers: Supplier[];
  onCreateOrder: (supplier: Supplier) => void;
  onRequestPrice: (supplier: Supplier) => void;
  onVerifySupplier: (supplierId: string) => void;
  onRejectSupplier: (supplierId: string) => void;
  onDeleteSupplier: (supplierId: string) => void;
}

export const SupplierTabs = ({
  searchQuery,
  onSearchChange,
  suppliers,
  onCreateOrder,
  onRequestPrice,
  onVerifySupplier,
  onRejectSupplier,
  onDeleteSupplier,
}: SupplierTabsProps) => {
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="enhanced-glass p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <Tabs defaultValue="liste" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="glass-effect">
            <TabsTrigger value="liste">Liste des Fournisseurs</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="performances">Performances</TabsTrigger>
            <TabsTrigger value="commandes">Commandes</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un fournisseur..."
              className="pl-10 glass-effect"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="liste">
          <SupplierList 
            suppliers={filteredSuppliers} 
            onCreateOrder={onCreateOrder}
            onRequestPrice={onRequestPrice}
            onDeleteSupplier={onDeleteSupplier}
          />
        </TabsContent>

        <TabsContent value="validation">
          <SupplierValidationList
            suppliers={filteredSuppliers.filter((s) => s.status === "En attente")}
            onValidate={onVerifySupplier}
            onReject={onRejectSupplier}
          />
        </TabsContent>

        <TabsContent value="performances">
          <SupplierPerformanceList suppliers={filteredSuppliers} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
