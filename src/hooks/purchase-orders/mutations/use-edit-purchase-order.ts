
import { useNavigate } from "react-router-dom";

export function useEditPurchaseOrder() {
  const navigate = useNavigate();
  
  return (id: string) => {
    navigate(`/purchase-order?edit=${id}`);
    return id;
  };
}
