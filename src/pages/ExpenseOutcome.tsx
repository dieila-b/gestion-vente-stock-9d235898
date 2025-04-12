
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";

// Hooks
import { useOutcomeCategories } from '@/hooks/use-outcome-categories';
import { useOutcomes } from '@/hooks/use-outcomes';
import { useIncomeCategories } from '@/hooks/use-income-categories';
import { useIncomes } from '@/hooks/use-incomes';
import { CategoryForm } from '@/components/expenses/CategoryForm';
import { OutcomeForm } from '@/components/expenses/OutcomeForm';
import { CategoriesList } from '@/components/expenses/CategoriesList';
import { OutcomesList } from '@/components/expenses/OutcomesList';
import { IncomeForm } from '@/components/expenses/IncomeForm';
import { IncomesList } from '@/components/expenses/IncomesList';

// Types
import { Category } from '@/types/category';
import { Outcome, Income } from '@/types/outcome';

export default function ExpenseOutcome() {
  const [activeTab, setActiveTab] = useState("expenses");
  
  // Expense categories
  const { 
    categories: expenseCategories, 
    isLoading: isLoadingExpenseCategories,
    createCategory: createExpenseCategory,
    deleteCategory: deleteExpenseCategory
  } = useOutcomeCategories();
  
  // Expenses
  const {
    outcomes,
    isLoading: isLoadingOutcomes,
    createOutcome,
    deleteOutcome
  } = useOutcomes();
  
  // Income categories
  const { 
    categories: incomeCategories, 
    isLoading: isLoadingIncomeCategories,
    createCategory: createIncomeCategory,
    deleteCategory: deleteIncomeCategory
  } = useIncomeCategories();
  
  // Incomes
  const {
    incomes,
    isLoading: isLoadingIncomes,
    createIncome,
    deleteIncome
  } = useIncomes();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion Financière</h1>
        
        <Tabs defaultValue="expenses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="expenses">Dépenses</TabsTrigger>
            <TabsTrigger value="incomes">Revenus</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-6">
                <CategoryForm 
                  onSubmit={createExpenseCategory.mutateAsync} 
                  isLoading={createExpenseCategory.isPending}
                  type="expense"
                />
                <CategoriesList 
                  categories={expenseCategories} 
                  onDelete={deleteExpenseCategory.mutateAsync}
                  isLoading={isLoadingExpenseCategories}
                  title="Catégories de dépenses"
                />
              </div>
              
              <div>
                <OutcomeForm 
                  onSubmit={createOutcome.mutateAsync}
                  categories={expenseCategories}
                  isLoading={createOutcome.isPending}
                />
              </div>
              
              <div>
                <OutcomesList 
                  outcomes={outcomes}
                  onDelete={deleteOutcome.mutateAsync}
                  isLoading={isLoadingOutcomes}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="incomes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-6">
                <CategoryForm 
                  onSubmit={createIncomeCategory.mutateAsync} 
                  isLoading={createIncomeCategory.isPending}
                  type="income"
                />
                <CategoriesList 
                  categories={incomeCategories} 
                  onDelete={deleteIncomeCategory.mutateAsync}
                  isLoading={isLoadingIncomeCategories}
                  title="Catégories de revenus"
                />
              </div>
              
              <div>
                <IncomeForm 
                  onSubmit={createIncome.mutateAsync}
                  categories={incomeCategories}
                  isLoading={createIncome.isPending}
                />
              </div>
              
              <div>
                <IncomesList 
                  incomes={incomes}
                  onDelete={deleteIncome.mutateAsync}
                  isLoading={isLoadingIncomes}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
