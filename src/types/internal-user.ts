
export type InternalUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "admin" | "manager" | "employee";
  address: string | null;
  is_active: boolean;
  photo_url: string | null;
};
