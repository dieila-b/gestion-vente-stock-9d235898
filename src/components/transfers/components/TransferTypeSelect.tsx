
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ControllerRenderProps } from "react-hook-form";
import { TransferFormValues } from "../schemas/transfer-form-schema";

interface TransferTypeSelectProps {
  field: ControllerRenderProps<TransferFormValues, "transfer_type">;
  onTypeChange: (value: string) => void;
}

export const TransferTypeSelect = ({
  field,
  onTypeChange,
}: TransferTypeSelectProps) => {
  return (
    <FormItem>
      <FormLabel>Type de transfert</FormLabel>
      <Select
        onValueChange={onTypeChange}
        defaultValue={field.value}
      >
        <FormControl>
          <SelectTrigger className="glass-effect">
            <SelectValue placeholder="Sélectionnez le type de transfert" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="depot_to_pos">Dépôt → Point de vente</SelectItem>
          <SelectItem value="pos_to_depot">Point de vente → Dépôt</SelectItem>
          <SelectItem value="depot_to_depot">Dépôt → Dépôt</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};
