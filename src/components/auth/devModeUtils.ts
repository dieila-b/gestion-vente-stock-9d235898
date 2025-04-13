
import { User } from "@/types/user";

export const getDevUser = (): User => {
  // Utilisateur fictif pour le développement
  return {
    id: "dev-user-id",
    first_name: "Dev",
    last_name: "User",
    email: "dev@example.com",
    phone: "1234567890",
    role: "admin",
    address: "Dev Address",
    is_active: true,
    photo_url: undefined
  };
};
