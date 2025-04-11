
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ExpenseIncomeTab } from "@/components/expenses/ExpenseIncomeTab";
import { ExpenseOutcomeTab } from "@/components/expenses/ExpenseOutcomeTab";

export default function Expenses() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Gestion des Dépenses & Revenus</h1>
        
        <Tabs defaultValue="income" className="mt-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
            <TabsTrigger value="income">Revenus</TabsTrigger>
            <TabsTrigger value="outcome">Dépenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income">
            <ExpenseIncomeTab />
          </TabsContent>
          
          <TabsContent value="outcome">
            <ExpenseOutcomeTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
