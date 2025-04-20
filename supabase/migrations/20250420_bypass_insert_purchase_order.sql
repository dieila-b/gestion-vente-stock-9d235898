
-- Create a database function to bypass RLS for purchase order insertion
-- This function will have SECURITY DEFINER privilege to bypass RLS
CREATE OR REPLACE FUNCTION public.bypass_insert_purchase_order(order_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  inserted_record jsonb;
BEGIN
  INSERT INTO public.purchase_orders (
    supplier_id,
    order_number,
    expected_delivery_date,
    notes,
    status,
    payment_status,
    paid_amount,
    logistics_cost,
    transit_cost,
    tax_rate,
    subtotal,
    tax_amount,
    total_ttc,
    shipping_cost,
    discount,
    total_amount,
    created_at,
    updated_at
  )
  VALUES (
    (order_data->>'supplier_id')::uuid,
    order_data->>'order_number',
    (order_data->>'expected_delivery_date')::timestamp with time zone,
    order_data->>'notes',
    order_data->>'status',
    order_data->>'payment_status',
    (order_data->>'paid_amount')::numeric,
    (order_data->>'logistics_cost')::numeric,
    (order_data->>'transit_cost')::numeric,
    (order_data->>'tax_rate')::numeric,
    (order_data->>'subtotal')::numeric,
    (order_data->>'tax_amount')::numeric,
    (order_data->>'total_ttc')::numeric,
    (order_data->>'shipping_cost')::numeric,
    (order_data->>'discount')::numeric,
    (order_data->>'total_amount')::numeric,
    (order_data->>'created_at')::timestamp with time zone,
    (order_data->>'updated_at')::timestamp with time zone
  )
  RETURNING to_jsonb(*) INTO inserted_record;
  
  RETURN inserted_record;
END;
$$;

-- Function to bypass RLS for purchase order items
CREATE OR REPLACE FUNCTION public.bypass_insert_purchase_order_items(items_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  inserted_records jsonb;
BEGIN
  WITH inserted AS (
    INSERT INTO public.purchase_order_items (
      purchase_order_id,
      product_id,
      quantity,
      unit_price,
      selling_price,
      total_price,
      product_code,
      designation,
      created_at
    )
    SELECT 
      (item->>'purchase_order_id')::uuid,
      (item->>'product_id')::uuid,
      (item->>'quantity')::integer,
      (item->>'unit_price')::numeric,
      (item->>'selling_price')::numeric,
      (item->>'total_price')::numeric,
      item->>'product_code',
      item->>'designation',
      (item->>'created_at')::timestamp with time zone
    FROM jsonb_array_elements(items_data) as item
    RETURNING to_jsonb(*)
  )
  SELECT jsonb_agg(to_jsonb(inserted)) INTO inserted_records FROM inserted;
  
  RETURN inserted_records;
END;
$$;
