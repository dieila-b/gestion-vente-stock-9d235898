
import { useNavigate } from "react-router-dom";

export function useEditPurchaseOrder() {
  const navigate = useNavigate();
  
  return (id: string) => {
    if (!id) {
      console.error("No purchase order ID provided for editing");
      return;
    }
    
    console.log("Editing purchase order:", id);
    
    // Navigate to the purchase-orders page with a state parameter indicating which order to edit
    navigate(`/purchase-orders`, { 
      state: { editOrderId: id }
    });
  };
}
