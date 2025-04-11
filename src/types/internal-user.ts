
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
