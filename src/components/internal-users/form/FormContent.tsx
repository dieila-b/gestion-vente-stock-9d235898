
import { Form } from "@/components/ui/form";
import { 
  NameFields,
  EmailField,
  PasswordFields,
  PhoneField,
  AddressField,
  RoleField,
  StatusField,
  PhotoField
} from "./FormFields";
import { FormActions } from "./FormActions";
import { UserFormValues } from "../validation/user-form-schema";
import { useUserForm } from "./hooks/useUserForm";
import { InternalUser } from "@/types/internal-user";

interface FormContentProps {
  onSubmit: (user: UserFormValues) => Promise<void>;
  onCancel: () => void;
  selectedUser: InternalUser | null;
}

export const FormContent = ({ 
  onSubmit, 
  onCancel, 
  selectedUser 
}: FormContentProps) => {
  const { form, isSubmitting, handleSubmit, isEditMode } = useUserForm({
    onSubmit,
    selectedUser
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <PhotoField form={form} />
        <NameFields form={form} />
        <EmailField form={form} />
        <PasswordFields form={form} />
        <PhoneField form={form} />
        <AddressField form={form} />
        <RoleField form={form} />
        <StatusField form={form} />
        
        <FormActions 
          isSubmitting={isSubmitting} 
          onCancel={onCancel} 
          isEditMode={isEditMode} 
        />
      </form>
    </Form>
  );
};
