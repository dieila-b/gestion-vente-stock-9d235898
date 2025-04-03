
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const PhoneField = ({ form }: { form: any }) => (
  <FormField
    control={form.control}
    name="phone"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Téléphone</FormLabel>
        <FormControl>
          <Input placeholder="Téléphone" {...field} value={field.value || ""} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
