
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { TransferFormValues } from "../schemas/transfer-form-schema";

interface TransferDateFieldProps {
  form: UseFormReturn<TransferFormValues>;
}

export const TransferDateField = ({ form }: TransferDateFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="transfer_date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date du transfert</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal glass-effect",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-md border-white/10" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
