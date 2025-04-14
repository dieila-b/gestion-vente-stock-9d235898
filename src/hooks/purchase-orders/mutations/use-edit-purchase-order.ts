
import { useNavigate } from "react-router-dom";

export function useEditPurchaseOrder() {
  const navigate = useNavigate();
  
  return (id: string) => {
    console.log("Editing purchase order:", id);
    // Navigate to the purchase-orders page with a state parameter indicating which order to edit
    navigate(`/purchase-orders`, { 
      state: { editOrderId: id }
    });
  };
}
