
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export const PasswordFields = ({ form }: { form: any }) => {
  const isEditMode = form.getValues().id ? true : false;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditMode ? "Nouveau mot de passe" : "Mot de passe"}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={isEditMode ? "Laisser vide pour ne pas changer" : "Mot de passe"} 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-xs">
                8 caractères min. avec majuscules, minuscules, chiffres et caractères spéciaux
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Confirmer le mot de passe" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="force_password_change"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Obliger l'utilisateur à changer son mot de passe à la première connexion
              </FormLabel>
              <FormDescription>
                L'utilisateur devra définir un nouveau mot de passe lors de sa première connexion
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
