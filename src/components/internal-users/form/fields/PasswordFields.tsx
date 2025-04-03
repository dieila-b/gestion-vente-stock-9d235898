
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "../../validation/user-form-schema";

interface PasswordFieldsProps {
  form: UseFormReturn<UserFormValues>;
}

export const PasswordFields = ({ form }: PasswordFieldsProps) => {
  const isEditMode = !!form.getValues().id;
  
  return (
    <>
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Mot de passe
              {!isEditMode && <span className="text-red-500">*</span>}
              {isEditMode && <span className="text-muted-foreground text-sm"> (laisser vide pour ne pas modifier)</span>}
            </FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={isEditMode ? "••••••••" : "Mot de passe"}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirm_password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Confirmer le mot de passe
              {!isEditMode && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={isEditMode ? "••••••••" : "Confirmer le mot de passe"}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
