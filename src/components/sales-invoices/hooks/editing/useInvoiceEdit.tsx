
import { useNavigate } from "react-router-dom";

export function useInvoiceEdit() {
  const navigate = useNavigate();

  const handleEditInvoice = (invoice: any) => {
    // Si la facture est déjà payée ou partiellement payée
    if (invoice.payment_status === 'paid' || invoice.payment_status === 'partial') {
      return false;
    }

    // Pour les factures non payées, continuer avec le comportement normal d'édition
    const editData = {
      orderId: invoice.id,
      client: invoice.client,
      items: invoice.items.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount || 0,
        category: item.product.category,
        image: item.product.image,
        deliveredQuantity: item.delivered_quantity || 0
      }))
    };

    localStorage.setItem('editInvoiceData', JSON.stringify(editData));
    navigate(`/pos?editOrder=${invoice.id}`);
    return true;
  };

  return { handleEditInvoice };
}
