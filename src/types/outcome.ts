
export interface Outcome {
  id: string;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  payment_method: string;
  receipt_number?: string;
  status?: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  category_id: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
}
