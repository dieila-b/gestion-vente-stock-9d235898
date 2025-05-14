
import { useState, useEffect } from 'react';
import { useTransfersData } from '@/hooks/transfers/use-transfers-data';
import { supabase } from '@/integrations/supabase/client';

export function useTransfers() {
  const [filteredTransfers, setFilteredTransfers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  const {
    transfers,
    isLoading,
    isError,
    refetch,
    deleteTransfer,
    fetchTransferById,
    posLocations,
    warehouses,
  } = useTransfersData();

  // Fetch products for the transfer form
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: catalogProducts, error } = await supabase
          .from('catalog')
          .select('id, name, stock, reference')
          .order('name');
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        console.log('Fetched products:', catalogProducts?.length || 0);
        setProducts(catalogProducts || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Filter transfers when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTransfers(transfers);
      return;
    }

    const filtered = transfers.filter(transfer => 
      transfer.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.source_warehouse?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.destination_warehouse?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredTransfers(filtered);
  }, [searchQuery, transfers]);

  // Debug logs to check warehouses and posLocations
  useEffect(() => {
    console.log("useTransfers hook data:", {
      warehouses: warehouses?.length,
      warehouses_data: warehouses,
      posLocations: posLocations?.length,
      posLocations_data: posLocations,
      products: products?.length,
      products_data: products
    });
  }, [warehouses, posLocations, products]);

  return {
    transfers,
    filteredTransfers,
    setFilteredTransfers,
    searchQuery,
    setSearchQuery,
    products,
    isLoading,
    isError,
    refetch,
    deleteTransfer,
    fetchTransferById,
    posLocations,
    warehouses,
  };
}
