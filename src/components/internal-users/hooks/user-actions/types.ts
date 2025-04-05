
export type SupabaseUser = {
  id: string;
  email?: string | null;
  aud: string;
  created_at?: string;
  confirmed_at?: string;
  [key: string]: any;
};

export type CreateUserData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
  photo_url?: string | null;
};
