
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { Client } from "@/types/client";
import { isSelectQueryError, safeGet, safeArray } from "@/utils/type-utils";

// Define types for the hook's return values
export interface SalesByProduct {
  id: string;
  name: string;
  total_quantity: number;
  total_amount: number;
  category: string;
  product_name?: string; // Add this to make it compatible with DailyProductSales
}

export interface PeriodTotals {
  total_sales: number;
  total_items: number;
  average_order: number;
  total?: number; // Add properties to match expected type in CustomReport
  paid?: number;
  remaining?: number;
}

export interface ClientSale {
  client: Client;
  total_amount: number;
  order_count: number;
  paid_amount?: number; // Added to make it compatible with DailyClientSales
  remaining_amount?: number; // Added to make it compatible with DailyClientSales
}

export function useCustomReportQueries(dateRange?: DateRange, selectedPOS: string = "all") {
  const [salesByProduct, setSalesByProduct] = useState<SalesByProduct[]>([]);
  const [periodTotals, setPeriodTotals] = useState<PeriodTotals>({
    total_sales: 0,
    total_items: 0,
    average_order: 0,
    total: 0,
    paid: 0,
    remaining: 0
  });
  const [clientSales, setClientSales] = useState<ClientSale[]>([]);
  
  // Query for product sales data
  const { data: rawSalesData, isLoading: isLoadingSalesProduct } = useQuery({
    queryKey: ['sales-by-product', dateRange, selectedPOS],
    queryFn: async () => {
      // Skip the query if the date range is not set
      if (!dateRange?.from || !dateRange?.to) return [];
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          total,
          discount,
          products:product_id(id, name, category),
          orders:order_id(created_at, status, pos_location_id)
        `)
        .gte('orders.created_at', dateRange.from.toISOString())
        .lte('orders.created_at', dateRange.to.toISOString())
        .eq('orders.status', 'completed');

      if (error) {
        console.error("Error fetching sales data:", error);
        return [];
      }
      
      // Safely filter data
      return (data || []).filter(item => {
        if (selectedPOS === "all") return true;
        
        // Safely check pos_location_id
        if (isSelectQueryError(item.orders)) {
          return false;
        }
        
        return item.orders?.pos_location_id === selectedPOS;
      });
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
  
  // Query for client sales data
  const { data: rawClientData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['sales-by-client', dateRange, selectedPOS],
    queryFn: async () => {
      // Skip the query if the date range is not set
      if (!dateRange?.from || !dateRange?.to) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          client_id,
          status,
          total,
          created_at,
          pos_location_id,
          clients:client_id(*)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .eq('status', 'completed');

      if (error) {
        console.error("Error fetching client sales data:", error);
        return [];
      }
      
      // Safely filter data
      return (data || []).filter(order => {
        if (selectedPOS === "all") return true;
        
        // Check for SelectQueryError
        if (isSelectQueryError(order)) {
          return false;
        }
        
        return order.pos_location_id === selectedPOS;
      });
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
  
  // Process sales data
  useEffect(() => {
    if (!rawSalesData || !Array.isArray(rawSalesData)) return;
    
    // Map to group sales by product
    const productSalesMap = new Map<string, SalesByProduct>();
    
    // Calculate totals
    let totalSales = 0;
    let totalItems = 0;
    
    rawSalesData.forEach((item) => {
      // Skip items with missing or error product data
      if (isSelectQueryError(item.products) || !item.products) return;
      
      const productId = item.product_id;
      const productName = item.products?.name || 'Unknown Product';
      const category = item.products?.category || 'Uncategorized';
      const quantity = Number(item.quantity) || 0;
      const amount = Number(item.total) || 0;
      
      totalSales += amount;
      totalItems += quantity;
      
      if (productSalesMap.has(productId)) {
        const existing = productSalesMap.get(productId)!;
        existing.total_quantity += quantity;
        existing.total_amount += amount;
      } else {
        productSalesMap.set(productId, {
          id: productId,
          name: productName,
          product_name: productName, // Add for compatibility
          category: category,
          total_quantity: quantity,
          total_amount: amount,
        });
      }
    });
    
    // Convert map to array and sort by total amount
    const productSalesArray = Array.from(productSalesMap.values())
      .sort((a, b) => b.total_amount - a.total_amount);
    
    setSalesByProduct(productSalesArray);
    
    // Calculate period totals
    const orderCount = new Set(rawSalesData.map(item => item.order_id)).size;
    setPeriodTotals({
      total_sales: totalSales,
      total_items: totalItems,
      average_order: orderCount > 0 ? totalSales / orderCount : 0,
      total: totalSales,
      paid: totalSales,
      remaining: 0
    });
  }, [rawSalesData]);
  
  // Process client data
  useEffect(() => {
    if (!rawClientData || !Array.isArray(rawClientData)) return;
    
    // Map to group sales by client
    const clientSalesMap = new Map<string, ClientSale>();
    
    rawClientData.forEach((order) => {
      // Skip orders with missing client data
      if (isSelectQueryError(order) || !order.client_id) return;
      
      const clientId = order.client_id;
      
      // Skip if client data is missing
      if (isSelectQueryError(order.clients) || !order.clients) return;
      
      // Ensure client has required properties
      const clientData = order.clients;
      const client: Client = {
        id: clientData.id || '',
        company_name: clientData.company_name || 'Unknown Company',
        contact_name: clientData.contact_name,
        email: clientData.email,
        phone: clientData.phone,
        status: clientData.status || 'unknown', // Ensure status exists
        created_at: clientData.created_at || '',
        updated_at: clientData.updated_at || ''
      };
      
      const amount = Number(order.total) || 0;
      
      if (clientSalesMap.has(clientId)) {
        const existing = clientSalesMap.get(clientId)!;
        existing.total_amount += amount;
        existing.order_count += 1;
      } else {
        clientSalesMap.set(clientId, {
          client,
          total_amount: amount,
          order_count: 1,
          paid_amount: amount, // Set for compatibility
          remaining_amount: 0  // Set for compatibility
        });
      }
    });
    
    // Convert map to array and sort by total amount
    const clientSalesArray = Array.from(clientSalesMap.values())
      .sort((a, b) => b.total_amount - a.total_amount);
    
    setClientSales(clientSalesArray);
  }, [rawClientData]);
  
  return { 
    salesByProduct, 
    periodTotals, 
    clientSales, 
    isLoading: isLoadingSalesProduct || isLoadingClients,
    isLoadingSalesProduct,
    isLoadingClients 
  };
}

// Make sure we export the hook as a named export
export default useCustomReportQueries;
