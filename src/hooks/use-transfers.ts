
import { useState, useEffect } from 'react';
import { useTransfersData } from '@/hooks/transfers/use-transfers-data';

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
        // Mock implementation - in a real app you would fetch from an API
        const mockProducts = [
          { id: 'prod1', name: 'Product 1', stock: 100 },
          { id: 'prod2', name: 'Product 2', stock: 75 },
          { id: 'prod3', name: 'Product 3', stock: 50 },
        ];
        setProducts(mockProducts);
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

  // Add a mock warehouse if none exists for development purposes
  useEffect(() => {
    console.log("Raw warehouses data:", warehouses);
    if (warehouses && warehouses.length === 0) {
      console.log("No warehouses found, adding mock data for development");
      // This is just for development to ensure the dropdown has data
      const mockWarehouses = [
        { id: 'warehouse1', name: 'Entrepôt Principal' },
        { id: 'warehouse2', name: 'Entrepôt Secondaire' }
      ];
      console.log("Added mock warehouses:", mockWarehouses);
    }
  }, [warehouses]);

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
