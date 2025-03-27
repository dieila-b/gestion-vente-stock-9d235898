
import { useState, useEffect } from "react";

export function useDeliveryStatus(initialFullyDelivered: boolean = false) {
  const [fullyDelivered, setFullyDelivered] = useState(initialFullyDelivered);
  const [partiallyDelivered, setPartiallyDelivered] = useState(false);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);

  // Set initial state based on the parameter
  useEffect(() => {
    if (initialFullyDelivered) {
      setFullyDelivered(true);
      setPartiallyDelivered(false);
    }
  }, [initialFullyDelivered]);

  const handleFullyDeliveredChange = (checked: boolean, updateAllItems?: (fullyDelivered: boolean) => void) => {
    console.log("Setting fully delivered to:", checked);
    setFullyDelivered(checked);
    if (checked) {
      setPartiallyDelivered(false);
      // Call the callback to update all items if provided
      if (updateAllItems) {
        updateAllItems(true);
      }
    }
  };

  const handlePartiallyDeliveredChange = (checked: boolean) => {
    console.log("Setting partially delivered to:", checked);
    setPartiallyDelivered(checked);
    if (checked) {
      setFullyDelivered(false);
    }
  };

  const resetDeliveryStatus = () => {
    setFullyDelivered(initialFullyDelivered);
    setPartiallyDelivered(false);
    setShowDeliveryOptions(false);
  };

  return {
    fullyDelivered,
    partiallyDelivered,
    showDeliveryOptions,
    setFullyDelivered,
    setPartiallyDelivered,
    setShowDeliveryOptions,
    handleFullyDeliveredChange,
    handlePartiallyDeliveredChange,
    resetDeliveryStatus
  };
}
