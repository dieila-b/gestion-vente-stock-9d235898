
import { useState, useEffect } from "react";
import { InternalUser } from "@/types/internal-user";

export const useUserForm = (user: InternalUser | null = null) => {
  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    role: "employee" as "admin" | "manager" | "employee" | string,
    password: "",
    confirm_password: "",
    is_active: true,
    photo_url: null as string | null,
  });

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    password: "",
    confirm_password: "",
  });

  // Populate form with user data if provided (for editing)
  useEffect(() => {
    if (user) {
      setFormValues({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role as "admin" | "manager" | "employee" | string,
        password: "",
        confirm_password: "",
        is_active: user.is_active,
        photo_url: user.photo_url,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Basic validation
    if (!formValues.first_name) {
      newErrors.first_name = "Le prénom est requis";
      isValid = false;
    }

    if (!formValues.last_name) {
      newErrors.last_name = "Le nom est requis";
      isValid = false;
    }

    if (!formValues.email) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }

    // Password validation only for new users
    if (!user) {
      if (!formValues.password) {
        newErrors.password = "Le mot de passe est requis";
        isValid = false;
      } else if (formValues.password.length < 6) {
        newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
        isValid = false;
      }

      if (formValues.password !== formValues.confirm_password) {
        newErrors.confirm_password = "Les mots de passe ne correspondent pas";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  return {
    formValues,
    errors,
    handleChange,
    validateForm,
    setFormValues,
  };
};
