
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsTab } from "@/components/catalog/ProductsTab";
import { UnitsTab } from "@/components/catalog/UnitsTab";
import { CategoriesTab } from "@/components/catalog/CategoriesTab";

export default function Catalog() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <Tabs defaultValue="products" className="flex-1">
          <div className="px-4 py-6">
            <TabsList className="enhanced-glass">
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="categories">Catégories</TabsTrigger>
              <TabsTrigger value="units">Unités</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>

          <TabsContent value="units">
            <UnitsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
