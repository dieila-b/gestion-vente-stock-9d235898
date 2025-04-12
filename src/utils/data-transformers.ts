
import { isSelectQueryError } from "@/utils/supabase-helpers";
import { safeClient, safeSupplier, safeCast, safeArray } from "@/utils/select-query-helper";

/**
 * Transform raw orders data to a usable client invoice format
 */
export function transformToClientInvoices(ordersData: any[]): any[] {
  if (!Array.isArray(ordersData)) return [];
  
  return ordersData.map(order => {
    // Create safe client
    const client = safeClient(order.client);
    
    // Create safe items array
    const items = safeArray(order.items, []).map(item => {
      return {
        id: item.id || "",
        quantity: item.quantity || 0,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 0),
        discount: item.discount || 0,
        products: item.product ? {
          name: safeCast(item.product, { name: "Unknown Product" }).name
        } : {
          name: "Unknown Product"
        }
      };
    });
    
    return {
      id: order.id,
      created_at: order.created_at,
      client,
      client_id: order.client_id,
      final_total: order.final_total || 0,
      paid_amount: order.paid_amount || 0,
      remaining_amount: order.remaining_amount || 0,
      payment_status: order.payment_status || "pending",
      items
    };
  });
}

/**
 * Transform raw invoice data to purchase invoice format
 */
export function transformToPurchaseInvoices(invoicesData: any[]): any[] {
  if (!Array.isArray(invoicesData)) return [];
  
  return invoicesData.map(invoice => {
    // Create a default delivery note if it's a SelectQueryError
    const delivery_note = isSelectQueryError(invoice.delivery_note) 
      ? { id: "", delivery_number: "N/A" } 
      : invoice.delivery_note || { id: "", delivery_number: "N/A" };
    
    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number || "",
      supplier_id: invoice.supplier_id || "",
      issue_date: invoice.issue_date || "",
      due_date: invoice.due_date || "",
      total_amount: invoice.total_amount || 0,
      tax_amount: invoice.tax_amount || 0,
      payment_status: invoice.payment_status || "pending",
      paid_amount: invoice.paid_amount || 0,
      remaining_amount: invoice.remaining_amount || 0,
      status: invoice.status || "pending",
      notes: invoice.notes || "",
      created_at: invoice.created_at || "",
      updated_at: invoice.updated_at || "",
      approved_at: invoice.approved_at || null,
      shipping_cost: invoice.shipping_cost || 0,
      delivery_note
    };
  });
}

/**
 * Transform raw quote data to quote format
 */
export function transformToQuotes(quotesData: any[]): any[] {
  if (!Array.isArray(quotesData)) return [];
  
  return quotesData.map(quote => {
    // Create safe client
    const client = isSelectQueryError(quote.client)
      ? { company_name: "Unknown Company" }
      : { 
          company_name: quote.client?.company_name || "Unknown Company" 
        };
    
    return {
      id: quote.id,
      quote_number: quote.quote_number || "",
      client_id: quote.client_id || "",
      issue_date: quote.issue_date || "",
      expiry_date: quote.expiry_date || "",
      total_amount: quote.total_amount || 0,
      status: quote.status || "pending",
      notes: quote.notes || "",
      created_at: quote.created_at || "",
      updated_at: quote.updated_at || "",
      client
    };
  });
}

/**
 * Transform warehouse stock items to stock items format
 */
export function transformToStockItems(stockData: any[]): any[] {
  if (!Array.isArray(stockData)) return [];
  
  return stockData.map(item => {
    // Create safe product
    const product = isSelectQueryError(item.product)
      ? { reference: "", name: "Unknown Product", category: "" }
      : {
          reference: item.product?.reference || "",
          name: item.product?.name || "Unknown Product",
          category: item.product?.category || ""
        };
    
    // Create safe warehouse
    const warehouse = isSelectQueryError(item.warehouse)
      ? { id: "", name: "Unknown Warehouse" }
      : {
          id: item.warehouse?.id || "",
          name: item.warehouse?.name || "Unknown Warehouse"
        };
    
    // Create safe pos location
    const pos_location = isSelectQueryError(item.pos_location)
      ? { id: "", name: "Unknown Location" }
      : {
          id: item.pos_location?.id || "",
          name: item.pos_location?.name || "Unknown Location"
        };
    
    return {
      id: item.id,
      quantity: item.quantity || 0,
      unit_price: item.unit_price || 0,
      total_value: item.total_value || 0,
      pos_location_id: item.pos_location_id || "",
      warehouse_id: item.warehouse_id || "",
      product,
      warehouse,
      pos_location
    };
  });
}

/**
 * Transform customer return data
 */
export function transformToCustomerReturn(returnData: any): any {
  if (!returnData) return null;
  
  // Create safe client
  const client = isSelectQueryError(returnData.client)
    ? { company_name: "Unknown Company" }
    : {
        company_name: returnData.client?.company_name || "Unknown Company"
      };
  
  // Create safe returned items
  const returned_items = Array.isArray(returnData.returned_items) 
    ? returnData.returned_items 
    : [];
  
  return {
    id: returnData.id,
    return_number: returnData.return_number || "",
    client_id: returnData.client_id || "",
    invoice_id: returnData.invoice_id || "",
    return_date: returnData.return_date || "",
    total_amount: returnData.total_amount || 0,
    status: returnData.status || "pending",
    reason: returnData.reason || "",
    notes: returnData.notes || "",
    created_at: returnData.created_at || "",
    updated_at: returnData.updated_at || "",
    client,
    invoice: returnData.invoice || null,
    returned_items
  };
}

/**
 * Transform unpaid invoice data
 */
export function transformToUnpaidInvoice(unpaidData: any[]): any[] {
  if (!Array.isArray(unpaidData)) return [];
  
  return unpaidData.map(invoice => {
    // Create safe client
    const client = isSelectQueryError(invoice.client)
      ? { id: "", company_name: "", contact_name: "" }
      : {
          id: invoice.client?.id || "",
          company_name: invoice.client?.company_name || "",
          contact_name: invoice.client?.contact_name || ""
        };
    
    return {
      id: invoice.id,
      created_at: invoice.created_at || "",
      client,
      client_id: invoice.client_id || "",
      invoice_number: invoice.invoice_number || "",
      amount: invoice.amount || invoice.final_total || 0,
      paid_amount: invoice.paid_amount || 0,
      remaining_amount: invoice.remaining_amount || 0,
      payment_status: invoice.payment_status || "pending",
      items_count: typeof invoice.items_count === 'number' ? invoice.items_count : 0
    };
  });
}
