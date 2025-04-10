
import { InternalUser } from "@/types/internal-user";
import { User } from "@supabase/supabase-js";

export type CreateUserData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  password: string;
  photo_url?: string | null;
  is_active?: boolean;
};

export type UpdateUserData = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
  photo_url?: string | null;
};

export interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  password: string;
  confirm_password: string;
  is_active?: boolean;
  photo_url?: string | null;
}

export interface SupabaseUser extends User {
  email?: string;
}
