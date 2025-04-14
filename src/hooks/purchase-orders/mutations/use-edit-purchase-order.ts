
import { useNavigate } from "react-router-dom";

export function useEditPurchaseOrder() {
  const navigate = useNavigate();
  
  return (id: string) => {
    navigate(`/purchase-orders/edit/${id}`);
    return id;
  };
}
