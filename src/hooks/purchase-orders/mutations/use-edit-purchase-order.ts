
import { useNavigate } from "react-router-dom";

export function useEditPurchaseOrder() {
  const navigate = useNavigate();
  
  return (id: string) => {
    // Since there's no specific edit route, we'll navigate back to the 
    // purchase-orders page with a state parameter indicating which order to edit
    navigate(`/purchase-orders`, { 
      state: { editOrderId: id }
    });
    return id;
  };
}
