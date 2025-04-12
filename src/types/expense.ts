
export interface Category {
  id: string;
  name: string;
  type: string;
}

export interface OutcomeEntry {
  id: string;
  amount: number;
  category_id: string;
  created_at: string;
  date: string;
  description: string;
  payment_method: string;
  receipt_number: string;
  status: string;
  category: Category;
}
