
export interface SupabaseInternalUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "admin" | "manager" | "employee";
  address: string | null;
  is_active: boolean;
  require_password_change?: boolean;
  two_factor_enabled?: boolean;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  auth_id?: string;
}

export type InternalUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "admin" | "manager" | "employee";
  address: string | null;
  is_active: boolean;
  require_password_change: boolean;
  two_factor_enabled: boolean;
  last_login: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  auth_id?: string;
};
