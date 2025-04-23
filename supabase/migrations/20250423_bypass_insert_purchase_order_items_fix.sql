
CREATE OR REPLACE FUNCTION public.bypass_insert_purchase_order_items(items_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result jsonb = '[]'::jsonb;
  item_array jsonb[];
  item_record jsonb;
  inserted_id uuid;
  item_result jsonb;
BEGIN
  -- Check if items_data is an array
  IF jsonb_typeof(items_data) = 'array' THEN
    -- Process each item in the array
    FOR i IN 0..jsonb_array_length(items_data) - 1
    LOOP
      item_record := items_data->i;
      
      INSERT INTO public.purchase_order_items (
        id,
        purchase_order_id,
        product_id,
        quantity,
        unit_price,
        selling_price,
        total_price,
        created_at
      ) VALUES (
        (item_record->>'id')::uuid,
        (item_record->>'purchase_order_id')::uuid,
        (item_record->>'product_id')::uuid,
        (item_record->>'quantity')::integer,
        (item_record->>'unit_price')::numeric,
        (item_record->>'selling_price')::numeric,
        (item_record->>'total_price')::numeric,
        (item_record->>'created_at')::timestamp with time zone
      ) RETURNING id INTO inserted_id;
      
      -- Build result JSON for this item
      SELECT jsonb_build_object(
        'id', id,
        'purchase_order_id', purchase_order_id,
        'product_id', product_id,
        'quantity', quantity,
        'unit_price', unit_price,
        'selling_price', selling_price,
        'total_price', total_price,
        'created_at', created_at
      ) INTO item_result
      FROM public.purchase_order_items
      WHERE id = inserted_id;
      
      -- Append to result array
      result = result || item_result;
    END LOOP;
  ELSE
    -- If it's a single item as a JSON object (not an array)
    -- This is a fallback for when a single JSON object is passed instead of an array
    IF jsonb_typeof(items_data) = 'object' THEN
      INSERT INTO public.purchase_order_items (
        id,
        purchase_order_id,
        product_id,
        quantity,
        unit_price,
        selling_price,
        total_price,
        created_at
      ) VALUES (
        (items_data->>'id')::uuid,
        (items_data->>'purchase_order_id')::uuid,
        (items_data->>'product_id')::uuid,
        (items_data->>'quantity')::integer,
        (items_data->>'unit_price')::numeric,
        (items_data->>'selling_price')::numeric,
        (items_data->>'total_price')::numeric,
        (items_data->>'created_at')::timestamp with time zone
      ) RETURNING id INTO inserted_id;
      
      -- Build result JSON for this item
      SELECT jsonb_build_object(
        'id', id,
        'purchase_order_id', purchase_order_id,
        'product_id', product_id,
        'quantity', quantity,
        'unit_price', unit_price,
        'selling_price', selling_price,
        'total_price', total_price,
        'created_at', created_at
      ) INTO item_result
      FROM public.purchase_order_items
      WHERE id = inserted_id;
      
      -- Set result as an array with a single item
      result = jsonb_build_array(item_result);
    END IF;
  END IF;
  
  RETURN result;
END;
$function$;
