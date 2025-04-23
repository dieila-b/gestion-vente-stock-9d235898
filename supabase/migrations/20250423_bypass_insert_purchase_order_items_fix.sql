
CREATE OR REPLACE FUNCTION public.bypass_insert_purchase_order_items(items_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result jsonb = '[]'::jsonb;
  item_record jsonb;
  inserted_id uuid;
  item_result jsonb;
  i integer;
BEGIN
  -- Check if items_data is an array
  IF jsonb_typeof(items_data) = 'array' THEN
    -- Process each item in the array
    FOR i IN 0..jsonb_array_length(items_data) - 1
    LOOP
      item_record := items_data->i;
      
      -- Generate a new UUID if not provided
      IF (item_record->>'id') IS NULL OR (item_record->>'id') = '' THEN
        item_record := jsonb_set(item_record, '{id}', to_jsonb(gen_random_uuid()));
      END IF;
      
      -- Insert the item with explicit values
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
        COALESCE((item_record->>'quantity')::integer, 1),
        COALESCE((item_record->>'unit_price')::numeric, 0),
        COALESCE((item_record->>'selling_price')::numeric, 0),
        COALESCE((item_record->>'total_price')::numeric, 0),
        COALESCE((item_record->>'created_at')::timestamp with time zone, now())
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
      -- Generate a new UUID if not provided
      IF (items_data->>'id') IS NULL OR (items_data->>'id') = '' THEN
        items_data := jsonb_set(items_data, '{id}', to_jsonb(gen_random_uuid()));
      END IF;
      
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
        COALESCE((items_data->>'quantity')::integer, 1),
        COALESCE((items_data->>'unit_price')::numeric, 0),
        COALESCE((items_data->>'selling_price')::numeric, 0),
        COALESCE((items_data->>'total_price')::numeric, 0),
        COALESCE((items_data->>'created_at')::timestamp with time zone, now())
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
