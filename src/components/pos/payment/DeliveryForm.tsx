
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect } from "react";

interface CartItemInfo {
  id: string;
  name: string;
  quantity: number;
}

interface DeliveryFormProps {
  items: CartItemInfo[];
  fullyDelivered: boolean;
  partiallyDelivered: boolean;
  deliveryItems: Record<string, { delivered: boolean, quantity: number }>;
  onFullyDeliveredChange: (checked: boolean) => void;
  onPartiallyDeliveredChange: (checked: boolean) => void;
  onDeliveredChange: (checked: boolean, itemId: string) => void;
  onQuantityChange: (value: number, itemId: string) => void;
}

export function DeliveryForm({
  items,
  fullyDelivered,
  partiallyDelivered,
  deliveryItems,
  onFullyDeliveredChange,
  onPartiallyDeliveredChange,
  onDeliveredChange,
  onQuantityChange
}: DeliveryFormProps) {
  // Determine which option is currently selected
  const selectedValue = fullyDelivered ? "fully" : 
                        partiallyDelivered ? "partially" : 
                        "awaiting";
  
  // Handle radio group changes
  const handleDeliveryStatusChange = (value: string) => {
    if (value === "fully") {
      console.log("Selected fully delivered");
      onFullyDeliveredChange(true);
    } else if (value === "partially") {
      console.log("Selected partially delivered");
      onPartiallyDeliveredChange(true);
    } else {
      console.log("Selected awaiting delivery");
      onFullyDeliveredChange(false);
      onPartiallyDeliveredChange(false);
    }
    
    console.log(`Delivery status changed to: ${value}`);
  };

  // Update check state when partially delivered is selected
  useEffect(() => {
    if (partiallyDelivered) {
      console.log("Partially delivered selected, ensuring items are properly initialized");
    }
  }, [partiallyDelivered]);

  // Handle checkbox change with automatic quantity update
  const handleCheckboxChange = (checked: boolean, itemId: string) => {
    console.log(`Checkbox for item ${itemId} changed to ${checked}`);
    onDeliveredChange(checked, itemId);
  };

  // Handle quantity input change with empty value support
  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const inputValue = e.target.value;
    
    // Allow empty input value (user clearing the field)
    if (inputValue === '') {
      // We'll treat this as a temporary state - don't update the model yet
      // Just update the input field visually
      e.target.value = '';
    } else {
      // If there's a value, convert to number and update
      const numValue = parseInt(inputValue, 10);
      if (!isNaN(numValue)) {
        console.log(`Setting quantity for item ${itemId} to ${numValue}`);
        onQuantityChange(numValue, itemId);
      }
    }
  };

  // Handle blur event to restore 0 if the field is left empty
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, itemId: string) => {
    if (e.target.value === '') {
      // When the field loses focus and is empty, set it back to 0
      console.log(`Setting quantity for item ${itemId} to 0 (field was empty)`);
      onQuantityChange(0, itemId);
      e.target.value = '0';
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup 
        value={selectedValue} 
        onValueChange={handleDeliveryStatusChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem id="fully-delivered" value="fully" />
          <Label htmlFor="fully-delivered">Entièrement livré</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem id="partially-delivered" value="partially" />
          <Label htmlFor="partially-delivered">Partiellement livré</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem id="awaiting-delivery" value="awaiting" />
          <Label htmlFor="awaiting-delivery">En Attente de Livraison</Label>
        </div>
      </RadioGroup>
      
      {partiallyDelivered && (
        <div className="space-y-2">
          <Label>Articles livrés:</Label>
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <Checkbox 
                id={`item-${item.id}`}
                checked={deliveryItems[item.id]?.delivered || false}
                onCheckedChange={(checked) => 
                  handleCheckboxChange(checked === true, item.id)
                }
                className="h-5 w-5"
              />
              <Label htmlFor={`item-${item.id}`} className="flex-1">{item.name}</Label>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor={`quantity-${item.id}`}>Quantité:</Label>
                <div className="flex items-center">
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    className="w-16 text-center"
                    value={deliveryItems[item.id]?.quantity || 0}
                    onChange={(e) => handleQuantityInputChange(e, item.id)}
                    onBlur={(e) => handleBlur(e, item.id)}
                    min={0}
                    max={item.quantity}
                    disabled={!deliveryItems[item.id]?.delivered}
                  />
                  
                  <div className="flex space-x-1 ml-1">
                    <button 
                      type="button"
                      className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                      onClick={() => {
                        const currentQty = deliveryItems[item.id]?.quantity || 0;
                        if (currentQty > 0) {
                          onQuantityChange(currentQty - 1, item.id);
                        }
                      }}
                      disabled={!deliveryItems[item.id]?.delivered || (deliveryItems[item.id]?.quantity || 0) <= 0}
                    >
                      -
                    </button>
                    <button 
                      type="button"
                      className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                      onClick={() => {
                        const currentQty = deliveryItems[item.id]?.quantity || 0;
                        if (currentQty < item.quantity) {
                          onQuantityChange(currentQty + 1, item.id);
                        }
                      }}
                      disabled={!deliveryItems[item.id]?.delivered || (deliveryItems[item.id]?.quantity || 0) >= item.quantity}
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="text-sm text-gray-500">/ {item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
