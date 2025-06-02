
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DeliveryNote } from "@/types/delivery-note";
import { OrderSummarySection } from "./OrderSummarySection";
import { LocationSelectionSection } from "./LocationSelectionSection";
import { QuantitiesTable } from "./QuantitiesTable";

interface ApprovalDialogContentProps {
  note: DeliveryNote;
  receivedQuantities: Record<string, number>;
  selectedLocationId: string;
  errors: string[];
  onQuantityChange: (itemId: string, value: string) => void;
  onLocationChange: (locationId: string) => void;
}

export function ApprovalDialogContent({
  note,
  receivedQuantities,
  selectedLocationId,
  errors,
  onQuantityChange,
  onLocationChange
}: ApprovalDialogContentProps) {
  console.log("ApprovalDialogContent - note:", note);
  console.log("ApprovalDialogContent - note.items:", note.items);
  console.log("ApprovalDialogContent - receivedQuantities:", receivedQuantities);

  return (
    <>
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <OrderSummarySection note={note} />
        <LocationSelectionSection
          selectedLocationId={selectedLocationId}
          onLocationChange={onLocationChange}
        />
        <QuantitiesTable
          note={note}
          receivedQuantities={receivedQuantities}
          onQuantityChange={onQuantityChange}
        />
      </div>
    </>
  );
}
