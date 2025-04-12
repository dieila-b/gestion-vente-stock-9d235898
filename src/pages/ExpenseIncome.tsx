import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/type-utils";

const ExpenseIncome = () => {
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: "",
    amount: 0,
    description: "",
    category_id: "",
    payment_method: "",
    receipt_number: "",
    status: ""
  });

  useEffect(() => {
    // Fetch expense categories
    const fetchExpenseCategories = async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*');

      if (error) {
        console.error("Error fetching expense categories:", error);
      } else {
        setExpenseCategories(data || []);
      }
    };

    fetchExpenseCategories();
  }, []);

  // Fetch income entries
  const { data, isLoading } = useQuery({
    queryKey: ['income-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_entries')
        .select('*, category:category_id(id, name, type)')
        .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to handle SelectQueryError
    return data?.map(entry => {
      // Handle SelectQueryError for category
      const safeCategory = isSelectQueryError(entry.category) 
        ? { id: '', name: 'Unknown', type: 'income' } 
        : entry.category;
        
      return {
        ...entry,
        category: safeCategory
      };
    }) || [];
  }
});

  useEffect(() => {
    if (data) {
      setIncomeEntries(data);
    }
  }, [data]);

  const handleInputChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('income_entries')
      .insert([newEntry]);

    if (error) {
      console.error("Error adding income entry:", error);
    } else {
      setIncomeEntries([...incomeEntries, newEntry]);
      setNewEntry({
        date: "",
        amount: 0,
        description: "",
        category_id: "",
        payment_method: "",
        receipt_number: "",
        status: ""
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Revenus</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={newEntry.date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Montant</label>
            <input
              type="number"
              name="amount"
              value={newEntry.amount}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              value={newEntry.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category ID</label>
            <select
              name="category_id"
              value={newEntry.category_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Category</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <input
              type="text"
              name="payment_method"
              value={newEntry.payment_method}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
            <input
              type="text"
              name="receipt_number"
              value={newEntry.receipt_number}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <input
              type="text"
              name="status"
              value={newEntry.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Ajouter un revenu
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4">Liste des revenus</h2>
      {isLoading ? (
        <p>Chargement des revenus...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incomeEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.category?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.payment_method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.receipt_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseIncome;
