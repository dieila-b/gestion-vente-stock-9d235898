
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "employee";
  address: string;
  is_active: boolean;
  photo_url?: string;
  password?: string;
}
