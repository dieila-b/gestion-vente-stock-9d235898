
import { InternalUser } from "@/types/internal-user";

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
  photo_url?: string | null;
}

export type SupabaseUser = {
  id: string;
  email?: string | null;
  [key: string]: any;
};
