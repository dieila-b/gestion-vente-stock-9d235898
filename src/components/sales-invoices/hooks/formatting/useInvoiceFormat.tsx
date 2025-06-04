
export function useInvoiceFormat() {
  const getItemsSummary = (invoice: any) => {
    if (!invoice.items || !Array.isArray(invoice.items)) {
      return "Aucun article";
    }
    
    const totalItems = invoice.items.length;
    const totalQuantity = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    
    if (totalItems === 0) {
      return "Aucun article";
    }
    
    if (totalItems === 1) {
      return `1 article (Qté: ${totalQuantity})`;
    }
    
    return `${totalItems} articles (Qté: ${totalQuantity})`;
  };

  const formatInvoiceItems = (invoice: any) => {
    if (!invoice.items || !Array.isArray(invoice.items)) {
      return [];
    }
    
    return invoice.items.map((item: any) => ({
      id: item.id,
      name: item.product?.name || `Produit #${item.product_id}`,
      quantity: item.quantity || 0,
      price: item.price || 0,
      discount: item.discount || 0,
      total: item.total || (item.quantity * item.price - (item.discount || 0)),
      delivered_quantity: item.delivered_quantity || 0,
      product_id: item.product_id
    }));
  };

  return {
    getItemsSummary,
    formatInvoiceItems
  };
}
