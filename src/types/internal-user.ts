
export interface InternalUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee" | string; // Allow string for backward compatibility
  photo_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NewInternalUser {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee" | string; // Allow string for backward compatibility
  password: string;
  is_active?: boolean;
  photo_url?: string | null;
}

export interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee" | string; // Modify this to be compatible with string
  password: string;
  confirm_password: string;
  is_active?: boolean;
  photo_url?: string | null;
}

export interface SupabaseUser extends User {
  email?: string;
}

// This is a mock User interface if not imported
interface User {
  id: string;
  email?: string;
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
  created_at?: string;
}
