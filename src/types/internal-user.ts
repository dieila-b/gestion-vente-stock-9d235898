
export type InternalUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "admin" | "manager" | "employee";
  address: string | null;
  is_active: boolean;
  // Making force_password_change optional since it doesn't exist in the database schema
  force_password_change?: boolean;
};
