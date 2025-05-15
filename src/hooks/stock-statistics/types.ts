
/**
 * Represents a stock item with location, product, and quantity information
 */
export interface StockItem {
  /**
   * Unique identifier for the stock record
   */
  id: string;
  
  /**
   * ID of the warehouse where this stock is located
   */
  warehouse_id: string;
  
  /**
   * Name of the warehouse or location
   */
  name: string;
  
  /**
   * Current quantity in stock
   */
  quantity: number;
  
  /**
   * Product information (from catalog)
   */
  product: {
    id: string;
    name: string;
    reference?: string;
    category?: string;
    [key: string]: any;
  };
  
  /**
   * Unit price of the product in this location
   */
  unit_price: number;
  
  /**
   * Total value of this stock item (quantity * unit_price)
   */
  total_value: number;
}
