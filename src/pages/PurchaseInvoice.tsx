
// Add missing state variables for error fixes
const [isCreating, setIsCreating] = useState(false);
const [isVisible, setIsVisible] = useState(false);
const [isUpdating, setIsUpdating] = useState(false);

// When mapping data to PurchaseInvoice type, add the required properties:
const mappedInvoices = data.map(invoice => ({
  ...invoice,
  tax_amount: invoice.tax_amount || 0,
  payment_status: invoice.payment_status || 'pending',
  due_date: invoice.due_date || new Date().toISOString(),
  paid_amount: invoice.paid_amount || 0,
  remaining_amount: invoice.total_amount - (invoice.paid_amount || 0),
  discount: invoice.discount || 0,
  notes: invoice.notes || '',
  shipping_cost: invoice.shipping_cost || 0,
  supplier: {
    name: invoice.supplier?.name || 'Unknown Supplier',
    phone: invoice.supplier?.phone || '',
    email: invoice.supplier?.email || ''
  },
  purchase_order: {
    id: invoice.purchase_order?.id || '',
    order_number: invoice.purchase_order?.order_number || ''
  },
  delivery_note: {
    id: invoice.delivery_note?.id || '',
    delivery_number: invoice.delivery_note?.delivery_number || ''
  }
})) as PurchaseInvoice[];

// When creating a new invoice, include all required properties:
const newInvoice = {
  invoice_number: generateInvoiceNumber(),
  supplier_id: selectedSupplier?.id || '',
  status: 'pending',
  total_amount: invoiceTotal,
  tax_amount: taxAmount,
  payment_status: 'pending',
  due_date: dueDate,
  paid_amount: paidAmount,
  remaining_amount: invoiceTotal - paidAmount,
  discount: discount,
  notes: notes,
  shipping_cost: shippingCost,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Fix the CartItem creation by adding product_id:
const cartItems: CartItem[] = invoiceItems.map(item => ({
  id: item.id,
  product_id: item.id, // Add the missing product_id
  name: item.name,
  quantity: item.quantity,
  price: item.price,
  category: item.category,
  discount: item.discount,
  subtotal: item.price * item.quantity - item.discount
}));
