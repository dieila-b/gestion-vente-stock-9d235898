
import { Button } from "@/components/ui/button";
import { Pencil, Printer, Check, Trash2 } from "lucide-react";
import { DeliveryNote } from "@/types/delivery-note";
import { useState } from "react";
import { DeliveryNoteValidationDialog } from "./DeliveryNoteValidationDialog";

interface DeliveryNoteActionsProps {
  note: DeliveryNote;
  selectedWarehouseId: string;
  onWarehouseSelect: (id: string) => void;
  onApprove: (id: string, warehouseId: string, items: Array<{ id: string; quantity_received: number }>) => void;
  onEdit: (id: string) => void;
  onPrint: (note: DeliveryNote) => void;
  onDelete: (id: string) => void;
  warehouses: Array<{ id: string; name: string }>;
}

export function DeliveryNoteActions({
  note,
  selectedWarehouseId,
  onWarehouseSelect,
  onApprove,
  onEdit,
  onPrint,
  onDelete,
  warehouses
}: DeliveryNoteActionsProps) {
  const [isValidationOpen, setIsValidationOpen] = useState(false);

  const handleValidate = (noteId: string, items: Array<{ id: string; quantity_received: number }>) => {
    onApprove(noteId, selectedWarehouseId, items);
    setIsValidationOpen(false);
  };

  return (
    <div className="flex gap-2 items-center">
      {note.status !== 'received' && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setIsValidationOpen(true)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => onEdit(note.id)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
        onClick={() => onPrint(note)}
      >
        <Printer className="w-4 h-4" />
      </Button>
      {note.status !== 'received' && (
        <Button
          variant="outline"
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      <DeliveryNoteValidationDialog
        note={isValidationOpen ? note : null}
        warehouseId={selectedWarehouseId}
        onWarehouseSelect={onWarehouseSelect}
        onValidate={handleValidate}
        onCancel={() => setIsValidationOpen(false)}
        warehouses={warehouses}
        open={isValidationOpen}
      />
    </div>
  );
}
