
CREATE OR REPLACE FUNCTION public.get_purchase_order_by_id(order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  order_data jsonb;
  items_data jsonb;
  supplier_data jsonb;
  warehouse_data jsonb;
BEGIN
  -- Get the purchase order
  SELECT jsonb_build_object(
    'id', po.id,
    'order_number', po.order_number,
    'created_at', po.created_at,
    'updated_at', po.updated_at,
    'status', po.status,
    'supplier_id', po.supplier_id,
    'discount', po.discount,
    'expected_delivery_date', po.expected_delivery_date,
    'notes', po.notes,
    'logistics_cost', po.logistics_cost,
    'transit_cost', po.transit_cost,
    'tax_rate', po.tax_rate,
    'shipping_cost', po.shipping_cost,
    'subtotal', po.subtotal,
    'tax_amount', po.tax_amount,
    'total_ttc', po.total_ttc,
    'total_amount', po.total_amount,
    'paid_amount', po.paid_amount,
    'payment_status', po.payment_status,
    'warehouse_id', po.warehouse_id
  ) INTO order_data
  FROM purchase_orders po
  WHERE po.id = order_id;
  
  IF order_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the supplier data
  SELECT jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'email', s.email,
    'phone', s.phone,
    'address', s.address
  ) INTO supplier_data
  FROM suppliers s
  WHERE s.id = (order_data->>'supplier_id')::uuid;
  
  -- Get the warehouse data if available
  IF (order_data->>'warehouse_id') IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', w.id,
      'name', w.name
    ) INTO warehouse_data
    FROM warehouses w
    WHERE w.id = (order_data->>'warehouse_id')::uuid;
  END IF;
  
  -- Get the order items
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', poi.id,
      'product_id', poi.product_id,
      'quantity', poi.quantity,
      'unit_price', poi.unit_price,
      'selling_price', poi.selling_price,
      'total_price', poi.total_price,
      'product', jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'reference', p.reference
      )
    )
  ) INTO items_data
  FROM purchase_order_items poi
  LEFT JOIN catalog p ON poi.product_id = p.id
  WHERE poi.purchase_order_id = order_id;
  
  -- Combine all data
  order_data = jsonb_set(order_data, '{supplier}', COALESCE(supplier_data, '{}'::jsonb));
  order_data = jsonb_set(order_data, '{warehouse}', COALESCE(warehouse_data, '{}'::jsonb));
  order_data = jsonb_set(order_data, '{items}', COALESCE(items_data, '[]'::jsonb));
  
  RETURN order_data;
END;
$function$;
