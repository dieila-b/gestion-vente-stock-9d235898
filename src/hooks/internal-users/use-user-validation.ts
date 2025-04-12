
import { toast } from "sonner";
import { User } from "@/types/user";

export const useUserValidation = () => {
  const validatePasswords = (
    users: Omit<User, 'id'>[],
    passwordConfirmation: { [key: number]: string }
  ) => {
    let isValid = true;
    
    for (const [index, user] of users.entries()) {
      if (!user.password) {
        toast.error(`L'utilisateur ${index + 1} doit avoir un mot de passe`);
        isValid = false;
        break;
      }
      
      if (passwordConfirmation[index] === undefined) {
        toast.error(`Veuillez confirmer le mot de passe pour l'utilisateur ${index + 1}`);
        isValid = false;
        break;
      }
      
      if (user.password !== passwordConfirmation[index]) {
        toast.error(`Les mots de passe ne correspondent pas pour l'utilisateur ${index + 1}`);
        isValid = false;
        break;
      }
    }
    
    return isValid;
  };

  const validateRequiredFields = (users: Omit<User, 'id'>[]) => {
    let isValid = true;
    
    for (const [index, user] of users.entries()) {
      if (!user.first_name || !user.first_name.trim()) {
        toast.error(`L'utilisateur ${index + 1} doit avoir un prénom`);
        isValid = false;
        break;
      }
      
      if (!user.last_name || !user.last_name.trim()) {
        toast.error(`L'utilisateur ${index + 1} doit avoir un nom`);
        isValid = false;
        break;
      }
      
      if (!user.email || !user.email.trim()) {
        toast.error(`L'utilisateur ${index + 1} doit avoir un email`);
        isValid = false;
        break;
      }
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        toast.error(`L'email de l'utilisateur ${index + 1} n'est pas valide`);
        isValid = false;
        break;
      }
    }
    
    return isValid;
  };

  return { validatePasswords, validateRequiredFields };
};
