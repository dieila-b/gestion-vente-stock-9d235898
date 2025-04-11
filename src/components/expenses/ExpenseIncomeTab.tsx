
// Update the renderCategory function to safely handle null values
const renderCategory = (income: any) => {
  if (!income.expense_categories || isSelectQueryError(income.expense_categories)) {
    return "Catégorie inconnue";
  }
  return income.expense_categories.name || "Catégorie inconnue";
};

// And when setting income entries state, transform the data to handle errors
setIncomeEntries(data.map((income: any) => ({
  id: income.id,
  amount: income.amount,
  date: income.date,
  description: income.description,
  category: !isSelectQueryError(income.expense_categories) 
    ? { 
        id: income.expense_categories?.id || "", 
        name: income.expense_categories?.name || "Catégorie inconnue", 
        type: income.expense_categories?.type || "income" 
      }
    : { id: "", name: "Catégorie inconnue", type: "income" }
})));
