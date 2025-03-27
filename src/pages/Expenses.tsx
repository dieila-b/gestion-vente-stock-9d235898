
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseIncomeTab } from "@/components/expenses/ExpenseIncomeTab";
import { ExpenseOutcomeTab } from "@/components/expenses/ExpenseOutcomeTab";
import { ExpenseCategoriesTab } from "@/components/expenses/ExpenseCategoriesTab";

export default function Expenses() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <Tabs defaultValue="outcome" className="flex-1">
          <div className="px-4 py-6">
            <TabsList className="enhanced-glass">
              <TabsTrigger value="outcome">Sorties</TabsTrigger>
              <TabsTrigger value="income">Entrées</TabsTrigger>
              <TabsTrigger value="categories">Catégories</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="outcome">
            <ExpenseOutcomeTab />
          </TabsContent>

          <TabsContent value="income">
            <ExpenseIncomeTab />
          </TabsContent>

          <TabsContent value="categories">
            <ExpenseCategoriesTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
