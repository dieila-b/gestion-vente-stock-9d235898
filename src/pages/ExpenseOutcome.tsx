
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useOutcomeCategories } from "@/hooks/use-outcome-categories";
import { useOutcomes } from "@/hooks/use-outcomes";
import { useIncomeCategories } from "@/hooks/use-income-categories";
import { useIncomes } from "@/hooks/use-incomes";
import { CategoryForm } from "@/components/expenses/CategoryForm";
import { OutcomeForm } from "@/components/expenses/OutcomeForm";
import { CategoriesList } from "@/components/expenses/CategoriesList";
import { OutcomesList } from "@/components/expenses/OutcomesList";
import { IncomeForm } from "@/components/expenses/IncomeForm";
import { IncomesList } from "@/components/expenses/IncomesList";

// Import types but rename them to prevent conflicts
import { Category as CategoryType } from "@/types/category";
import { OutcomeEntry as OutcomeEntryType } from "@/types/outcome";

export default function ExpenseOutcome() {
  const [activeTab, setActiveTab] = useState("expenses");
  const { categories: expenseCategories, addCategory: addExpenseCategory, deleteCategory: deleteExpenseCategory } = useOutcomeCategories();
  const { entries: outcomes, addEntry: addOutcome, deleteEntry: deleteOutcome } = useOutcomes();
  const { categories: incomeCategories, addCategory: addIncomeCategory, deleteCategory: deleteIncomeCategory } = useIncomeCategories();
  const { entries: incomes, addEntry: addIncome, deleteEntry: deleteIncome } = useIncomes();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Dépenses et Revenus</h1>
      
      <Tabs defaultValue="expenses" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          <TabsTrigger value="income">Revenus</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6">
              <h2 className="text-lg font-semibold mb-4">Catégories de Dépenses</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryForm onSubmit={addExpenseCategory} type="expense" />
                <CategoriesList 
                  categories={expenseCategories} 
                  onDelete={deleteExpenseCategory} 
                />
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Ajouter une Dépense</h2>
              <OutcomeForm 
                onSubmit={addOutcome} 
                categories={expenseCategories} 
              />
            </Card>
          </div>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Liste des Dépenses</h2>
            <OutcomesList 
              outcomes={outcomes} 
              onDelete={deleteOutcome} 
              categories={expenseCategories}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6">
              <h2 className="text-lg font-semibold mb-4">Catégories de Revenus</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryForm onSubmit={addIncomeCategory} type="income" />
                <CategoriesList 
                  categories={incomeCategories} 
                  onDelete={deleteIncomeCategory} 
                />
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Ajouter un Revenu</h2>
              <IncomeForm 
                onSubmit={addIncome} 
                categories={incomeCategories} 
              />
            </Card>
          </div>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Liste des Revenus</h2>
            <IncomesList 
              incomes={incomes} 
              onDelete={deleteIncome} 
              categories={incomeCategories}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
