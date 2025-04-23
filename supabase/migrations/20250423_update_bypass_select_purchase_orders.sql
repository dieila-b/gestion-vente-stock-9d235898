
-- Mise à jour de la fonction pour inclure le champ contact dans les données fournisseur
CREATE OR REPLACE FUNCTION public.bypass_select_purchase_orders()
RETURNS SETOF jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
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
    'warehouse_id', po.warehouse_id,
    'supplier', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'email', s.email,
      'phone', s.phone,
      'contact', s.contact
    )
  )
  FROM public.purchase_orders po
  LEFT JOIN public.suppliers s ON po.supplier_id = s.id
  ORDER BY po.created_at DESC;
END;
$$;
