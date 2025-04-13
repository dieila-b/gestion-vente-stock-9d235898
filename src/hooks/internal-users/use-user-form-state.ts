
import { useState } from "react";
import { User } from "@/types/user";
import { toast } from "sonner";
import { useImageUpload } from "./use-image-upload";

export const useUserFormState = () => {
  // État initial pour un nouvel utilisateur
  const emptyUser: Omit<User, 'id'> = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "employee",
    address: "",
    is_active: true,
    password: ""
  };

  // États
  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>[]>([{ ...emptyUser }]);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Hook pour l'upload d'image
  const { uploadImage } = useImageUpload();

  // Gestionnaires d'événements
  const handleInputChange = (
    index: number,
    field: keyof Omit<User, 'id'>,
    value: string | boolean | "admin" | "manager" | "employee"
  ) => {
    setNewUserData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handlePasswordConfirmationChange = (value: string) => {
    setPasswordConfirmation(value);
  };

  const handleAddUser = () => {
    setNewUserData(prev => [...prev, { ...emptyUser }]);
  };

  const handleRemoveUser = (index: number) => {
    setNewUserData(prev => prev.filter((_, i) => i !== index));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const url = await uploadImage(file);
      
      if (url) {
        handleInputChange(index, 'photo_url', url);
        toast.success("Image téléchargée avec succès");
      }
    } catch (error: any) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      toast.error(`Erreur lors du téléchargement: ${error.message || "Une erreur s'est produite"}`);
    }
  };

  const resetFormState = () => {
    setNewUserData([{ ...emptyUser }]);
    setPasswordConfirmation("");
    setShowPassword(false);
  };

  return {
    newUserData,
    passwordConfirmation,
    showPassword,
    handleInputChange,
    handlePasswordConfirmationChange,
    handleAddUser,
    handleRemoveUser,
    togglePasswordVisibility,
    handleImageUpload,
    resetFormState
  };
};
