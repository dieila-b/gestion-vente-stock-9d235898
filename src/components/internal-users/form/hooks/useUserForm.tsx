
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { InternalUser } from "@/types/internal-user";
import { userFormSchema, UserFormValues } from "../../validation/user-form-schema";

interface UseUserFormProps {
  onSubmit: (user: UserFormValues) => Promise<void>;
  selectedUser: InternalUser | null;
}

/**
 * Hook for managing the user form state and submission
 */
export const useUserForm = ({ onSubmit, selectedUser }: UseUserFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: selectedUser?.first_name || "",
      last_name: selectedUser?.last_name || "",
      email: selectedUser?.email || "",
      password: "",
      confirm_password: "",
      phone: selectedUser?.phone || "",
      address: selectedUser?.address || "",
      role: selectedUser?.role || "employee",
      is_active: selectedUser?.is_active ?? true,
      id: selectedUser?.id,
      photo_url: selectedUser?.photo_url || null,
    },
  });

  const handleSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Error is already handled in useUserActions
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit,
    isEditMode: !!selectedUser
  };
};
