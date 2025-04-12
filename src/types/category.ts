
export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  created_at?: string;
}
