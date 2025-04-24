
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order';

// Type definitions for Supabase JSON response
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Type guard function to check if a string is a valid status
function isValidStatus(status: string): status is PurchaseOrder['status'] {
  return ['draft', 'pending', 'delivered', 'approved'].includes(status);
}

// Type guard function to check if a string is a valid payment status
function isValidPaymentStatus(status: string): status is PurchaseOrder['payment_status'] {
  return ['pending', 'partial', 'paid'].includes(status);
}

// Type guard to check if object has a specific property
function hasProperty<K extends string, T extends object>(obj: T, prop: K): obj is T & { [key in K]: unknown } {
  return obj && typeof obj === 'object' && prop in obj;
}

// Function to check if value is an object
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Hook to fetch and manage purchase order data
 */
export function usePurchaseData(orderId?: string) {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({});
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);

  // Fetch the purchase order using the Supabase RPC function
  const { data: purchase, isLoading: isPurchaseLoading, refetch } = useQuery<PurchaseOrder | null>({
    queryKey: ['purchase', orderId],
    queryFn: async () => {
      if (!orderId) {
        console.log("No order ID provided");
        return null;
      }

      try {
        console.log(`Fetching purchase order with ID: ${orderId}`);
        
        // Call the RPC function to get the purchase order by ID
        const { data, error } = await supabase
          .rpc('get_purchase_order_by_id', { order_id: orderId });
        
        if (error) {
          console.error("Error fetching purchase order:", error);
          toast.error(`Erreur: ${error.message}`);
          throw error;
        }
        
        if (!data) {
          console.error("No purchase order found with ID:", orderId);
          toast.error("Bon de commande non trouvé");
          return null;
        }

        console.log("Purchase order data retrieved:", data);
        
        // Ensure data is an object before trying to process it
        if (!isObject(data)) {
          throw new Error("Invalid data format received: data is not an object");
        }

        // If we successfully get purchase data but no items, fetch them separately
        if ((!hasProperty(data, 'items') || !Array.isArray(data.items) || data.items.length === 0)) {
          console.log("No items in purchase order data, fetching items separately...");
          try {
            const { data: itemsData, error: itemsError } = await supabase
              .from('purchase_order_items')
              .select(`
                id, 
                product_id, 
                quantity, 
                unit_price, 
                selling_price, 
                total_price,
                product:product_id (
                  id,
                  name,
                  reference
                )
              `)
              .eq('purchase_order_id', orderId);

            if (itemsError) {
              console.error("Error fetching items separately:", itemsError);
            } else if (itemsData) {
              console.log(`Fetched ${itemsData.length} items separately:`, itemsData);
              data.items = itemsData;
            }
          } catch (itemsError) {
            console.error("Exception fetching items separately:", itemsError);
          }
        }
        
        // Process the items with proper type checking
        let processedItems: PurchaseOrderItem[] = [];
        
        if (hasProperty(data, 'items') && Array.isArray(data.items)) {
          console.log("Items data:", data.items);
          processedItems = data.items.map(item => {
            // Ensure each item is an object
            if (!isObject(item)) {
              console.error("Item is not an object:", item);
              return {
                id: '',
                product_id: '',
                purchase_order_id: orderId,
                quantity: 0,
                unit_price: 0,
                selling_price: 0,
                total_price: 0
              };
            }
            
            return {
              id: hasProperty(item, 'id') ? String(item.id || '') : '',
              product_id: hasProperty(item, 'product_id') ? String(item.product_id || '') : '',
              purchase_order_id: orderId,
              quantity: hasProperty(item, 'quantity') ? Number(item.quantity || 0) : 0,
              unit_price: hasProperty(item, 'unit_price') ? Number(item.unit_price || 0) : 0,
              selling_price: hasProperty(item, 'selling_price') ? Number(item.selling_price || 0) : 0,
              total_price: hasProperty(item, 'total_price') ? Number(item.total_price || 0) : 0,
              product: hasProperty(item, 'product') && isObject(item.product) ? {
                id: hasProperty(item.product, 'id') ? String(item.product.id || '') : '',
                name: hasProperty(item.product, 'name') ? String(item.product.name || '') : '',
                reference: hasProperty(item.product, 'reference') ? String(item.product.reference) : undefined
              } : undefined
            };
          });
          
          console.log(`Processed ${processedItems.length} items from order data:`, processedItems);
        } else {
          console.warn("No items array in order data, or invalid format");
        }
        
        // Create a properly typed PurchaseOrder object with type checking
        const purchaseOrder: PurchaseOrder = {
          id: hasProperty(data, 'id') ? String(data.id || '') : '',
          order_number: hasProperty(data, 'order_number') ? String(data.order_number || '') : '',
          created_at: hasProperty(data, 'created_at') ? String(data.created_at || '') : '',
          updated_at: hasProperty(data, 'updated_at') ? String(data.updated_at) : undefined,
          status: hasProperty(data, 'status') && isValidStatus(String(data.status)) 
            ? String(data.status) as PurchaseOrder['status'] 
            : 'pending',
          supplier_id: hasProperty(data, 'supplier_id') ? String(data.supplier_id || '') : '',
          discount: hasProperty(data, 'discount') ? Number(data.discount || 0) : 0,
          expected_delivery_date: hasProperty(data, 'expected_delivery_date') ? String(data.expected_delivery_date || '') : '',
          notes: hasProperty(data, 'notes') ? String(data.notes || '') : '',
          logistics_cost: hasProperty(data, 'logistics_cost') ? Number(data.logistics_cost || 0) : 0,
          transit_cost: hasProperty(data, 'transit_cost') ? Number(data.transit_cost || 0) : 0,
          tax_rate: hasProperty(data, 'tax_rate') ? Number(data.tax_rate || 0) : 0,
          shipping_cost: hasProperty(data, 'shipping_cost') ? Number(data.shipping_cost || 0) : 0,
          subtotal: hasProperty(data, 'subtotal') ? Number(data.subtotal || 0) : 0,
          tax_amount: hasProperty(data, 'tax_amount') ? Number(data.tax_amount || 0) : 0,
          total_ttc: hasProperty(data, 'total_ttc') ? Number(data.total_ttc || 0) : 0,
          total_amount: hasProperty(data, 'total_amount') ? Number(data.total_amount || 0) : 0,
          paid_amount: hasProperty(data, 'paid_amount') ? Number(data.paid_amount || 0) : 0,
          payment_status: hasProperty(data, 'payment_status') && isValidPaymentStatus(String(data.payment_status)) 
            ? String(data.payment_status) as PurchaseOrder['payment_status'] 
            : 'pending',
          warehouse_id: hasProperty(data, 'warehouse_id') ? String(data.warehouse_id) : undefined,
          supplier: hasProperty(data, 'supplier') && isObject(data.supplier) ? {
            id: hasProperty(data.supplier, 'id') ? String(data.supplier.id || '') : '',
            name: hasProperty(data.supplier, 'name') ? String(data.supplier.name || '') : '',
            email: hasProperty(data.supplier, 'email') ? String(data.supplier.email || '') : '',
            phone: hasProperty(data.supplier, 'phone') ? String(data.supplier.phone || '') : '',
            address: hasProperty(data.supplier, 'address') ? String(data.supplier.address || '') : '',
            contact: hasProperty(data.supplier, 'contact') ? String(data.supplier.contact || '') : ''
          } : {
            id: '',
            name: '',
            email: '',
            phone: '',
            address: '',
            contact: ''
          },
          warehouse: hasProperty(data, 'warehouse') && isObject(data.warehouse) ? {
            id: hasProperty(data.warehouse, 'id') ? String(data.warehouse.id || '') : '',
            name: hasProperty(data.warehouse, 'name') ? String(data.warehouse.name || '') : ''
          } : undefined,
          items: processedItems
        };
        
        // Set the order items immediately when data is received
        setOrderItems(processedItems);
        
        return purchaseOrder;
      } catch (error) {
        console.error("Error fetching purchase order:", error);
        toast.error("Erreur lors du chargement du bon de commande");
        return null;
      }
    },
    enabled: !!orderId,
    retry: 3, // Increase retries for better reliability
    staleTime: 5 * 60 * 1000 // 5 minutes - data won't be considered stale for 5 minutes
  });

  // Update form data when purchase data is loaded
  useEffect(() => {
    if (purchase) {
      console.log("Setting form data from purchase:", purchase.id);
      setFormData({
        supplier_id: purchase.supplier_id,
        order_number: purchase.order_number,
        expected_delivery_date: purchase.expected_delivery_date,
        notes: purchase.notes,
        status: purchase.status,
        payment_status: purchase.payment_status,
        discount: purchase.discount,
        shipping_cost: purchase.shipping_cost,
        logistics_cost: purchase.logistics_cost,
        transit_cost: purchase.transit_cost,
        tax_rate: purchase.tax_rate,
        paid_amount: purchase.paid_amount
      });
      
      // Also ensure the orderItems are updated from purchase data if available
      if (purchase.items && purchase.items.length > 0) {
        console.log("Setting order items from purchase data:", purchase.items.length);
        setOrderItems(purchase.items);
      }
    }
  }, [purchase]);

  // Update a field in the form data
  const updateFormField = (field: keyof PurchaseOrder, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    purchase,
    formData,
    orderItems,
    setOrderItems,
    updateFormField,
    isPurchaseLoading,
    refetch
  };
}
