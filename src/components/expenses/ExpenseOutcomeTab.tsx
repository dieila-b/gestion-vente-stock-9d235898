
// Update the renderCategory function to safely handle null values
const renderCategory = (item: any) => {
  if (!item.expense_categories || isSelectQueryError(item.expense_categories)) {
    return "Catégorie inconnue";
  }
  return item.expense_categories.name || "Catégorie inconnue";
};

// Transform the data when setting state
setOutcomeEntries(data.map((item: any) => ({
  id: item.id,
  amount: item.amount,
  description: item.description,
  date: item.date,
  expense_category_id: item.expense_category_id,
  created_at: item.created_at,
  receipt_number: item.receipt_number || "",
  payment_method: item.payment_method || "",
  status: item.status || "completed",
  category: !isSelectQueryError(item.expense_categories) 
    ? { 
        id: item.expense_categories?.id || "", 
        name: item.expense_categories?.name || "Catégorie inconnue", 
        type: item.expense_categories?.type || "expense" 
      }
    : { id: "", name: "Catégorie inconnue", type: "expense" }
})));
