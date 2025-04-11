
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseIncomeTab } from "@/components/expenses/ExpenseIncomeTab";
import { ExpenseOutcomeTab } from "@/components/expenses/ExpenseOutcomeTab";
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('income');

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des Finances</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="income">Revenus</TabsTrigger>
            <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income">
            <ExpenseIncomeTab />
          </TabsContent>
          
          <TabsContent value="expenses">
            <ExpenseOutcomeTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
