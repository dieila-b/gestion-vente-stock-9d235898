
export function useInvoiceFormat() {
  const getItemsSummary = (invoice: any) => {
    if (!invoice.items || invoice.items.length === 0) return "Aucun article";
    
    const firstItem = invoice.items[0];
    const productName = firstItem.product?.name || "Produit inconnu";
    
    if (invoice.items.length === 1) return productName;
    
    return `${productName} + ${invoice.items.length - 1} autres`;
  };

  const formatInvoiceItems = (invoice: any) => {
    return invoice.items.map((item: any) => {
      // Calculate total as price * quantity (before discount)
      const totalPrice = item.price * item.quantity;
      // Calculate total item discount
      const totalDiscount = (item.discount || 0) * item.quantity;
      
      return {
        id: item.id,
        name: item.product?.name || 'Produit inconnu',
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        image: item.product?.image,
        delivered: item.delivered_quantity ? item.delivered_quantity > 0 : false,
        deliveredQuantity: item.delivered_quantity || 0,
        total: totalPrice,
        totalDiscount: totalDiscount
      };
    });
  };

  return {
    getItemsSummary,
    formatInvoiceItems
  };
}
