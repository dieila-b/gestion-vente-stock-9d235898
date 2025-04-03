
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export const AddressField = ({ form }: { form: any }) => (
  <FormField
    control={form.control}
    name="address"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Adresse</FormLabel>
        <FormControl>
          <Textarea 
            placeholder="Adresse" 
            {...field} 
            value={field.value || ""} 
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
