
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProductUnitsList } from "@/components/catalog/ProductUnitsList";

export default function ProductUnits() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Unités d'Articles</h1>
      <ProductUnitsList />
    </div>
  );
}
