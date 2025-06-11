
-- Désactiver RLS temporairement pour les tables principales du POS
-- En environnement de développement, on peut désactiver RLS pour simplifier l'accès aux données

-- Tables critiques pour le POS
ALTER TABLE public.catalog DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_stock DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register_transactions DISABLE ROW LEVEL SECURITY;

-- Tables de gestion des stocks
ALTER TABLE public.warehouses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_principal DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees_stock DISABLE ROW LEVEL SECURITY;

-- Tables de gestion des achats
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_note_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoice_payments DISABLE ROW LEVEL SECURITY;

-- Tables diverses
ALTER TABLE public.preorders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.preorder_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_return_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_return_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Ajouter les contraintes de clés étrangères manquantes importantes
-- Supprimer d'abord les contraintes existantes si elles existent, puis les recréer

-- Relations pour les commandes
DO $$ 
BEGIN
    -- Supprimer la contrainte si elle existe déjà
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_order_items_order_id' AND table_name = 'order_items') THEN
        ALTER TABLE public.order_items DROP CONSTRAINT fk_order_items_order_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_order_items_product_id' AND table_name = 'order_items') THEN
        ALTER TABLE public.order_items DROP CONSTRAINT fk_order_items_product_id;
    END IF;
END $$;

ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES public.catalog(id) ON DELETE SET NULL;

-- Relations pour les factures de vente
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_sales_invoice_items_invoice_id' AND table_name = 'sales_invoice_items') THEN
        ALTER TABLE public.sales_invoice_items DROP CONSTRAINT fk_sales_invoice_items_invoice_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_sales_invoice_items_product_id' AND table_name = 'sales_invoice_items') THEN
        ALTER TABLE public.sales_invoice_items DROP CONSTRAINT fk_sales_invoice_items_product_id;
    END IF;
END $$;

ALTER TABLE public.sales_invoice_items 
ADD CONSTRAINT fk_sales_invoice_items_invoice_id 
FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(id) ON DELETE CASCADE;

ALTER TABLE public.sales_invoice_items 
ADD CONSTRAINT fk_sales_invoice_items_product_id 
FOREIGN KEY (product_id) REFERENCES public.catalog(id) ON DELETE SET NULL;

-- Relations pour le stock des entrepôts
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_warehouse_stock_product_id' AND table_name = 'warehouse_stock') THEN
        ALTER TABLE public.warehouse_stock DROP CONSTRAINT fk_warehouse_stock_product_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_warehouse_stock_warehouse_id' AND table_name = 'warehouse_stock') THEN
        ALTER TABLE public.warehouse_stock DROP CONSTRAINT fk_warehouse_stock_warehouse_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_warehouse_stock_pos_location_id' AND table_name = 'warehouse_stock') THEN
        ALTER TABLE public.warehouse_stock DROP CONSTRAINT fk_warehouse_stock_pos_location_id;
    END IF;
END $$;

ALTER TABLE public.warehouse_stock 
ADD CONSTRAINT fk_warehouse_stock_product_id 
FOREIGN KEY (product_id) REFERENCES public.catalog(id) ON DELETE CASCADE;

ALTER TABLE public.warehouse_stock 
ADD CONSTRAINT fk_warehouse_stock_warehouse_id 
FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;

ALTER TABLE public.warehouse_stock 
ADD CONSTRAINT fk_warehouse_stock_pos_location_id 
FOREIGN KEY (pos_location_id) REFERENCES public.pos_locations(id) ON DELETE CASCADE;

-- Relations pour les mouvements de stock
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_warehouse_stock_movements_product_id' AND table_name = 'warehouse_stock_movements') THEN
        ALTER TABLE public.warehouse_stock_movements DROP CONSTRAINT fk_warehouse_stock_movements_product_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_warehouse_stock_movements_warehouse_id' AND table_name = 'warehouse_stock_movements') THEN
        ALTER TABLE public.warehouse_stock_movements DROP CONSTRAINT fk_warehouse_stock_movements_warehouse_id;
    END IF;
END $$;

ALTER TABLE public.warehouse_stock_movements 
ADD CONSTRAINT fk_warehouse_stock_movements_product_id 
FOREIGN KEY (product_id) REFERENCES public.catalog(id) ON DELETE CASCADE;

ALTER TABLE public.warehouse_stock_movements 
ADD CONSTRAINT fk_warehouse_stock_movements_warehouse_id 
FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;

-- Relations pour les clients
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_orders_client_id' AND table_name = 'orders') THEN
        ALTER TABLE public.orders DROP CONSTRAINT fk_orders_client_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_sales_invoices_client_id' AND table_name = 'sales_invoices') THEN
        ALTER TABLE public.sales_invoices DROP CONSTRAINT fk_sales_invoices_client_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_sales_invoices_order_id' AND table_name = 'sales_invoices') THEN
        ALTER TABLE public.sales_invoices DROP CONSTRAINT fk_sales_invoices_order_id;
    END IF;
END $$;

ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_client_id 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.sales_invoices 
ADD CONSTRAINT fk_sales_invoices_client_id 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.sales_invoices 
ADD CONSTRAINT fk_sales_invoices_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- Relations pour les paiements
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_order_payments_order_id' AND table_name = 'order_payments') THEN
        ALTER TABLE public.order_payments DROP CONSTRAINT fk_order_payments_order_id;
    END IF;
END $$;

ALTER TABLE public.order_payments 
ADD CONSTRAINT fk_order_payments_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Relations pour les registres de caisse
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_cash_register_transactions_register_id' AND table_name = 'cash_register_transactions') THEN
        ALTER TABLE public.cash_register_transactions DROP CONSTRAINT fk_cash_register_transactions_register_id;
    END IF;
END $$;

ALTER TABLE public.cash_register_transactions 
ADD CONSTRAINT fk_cash_register_transactions_register_id 
FOREIGN KEY (cash_register_id) REFERENCES public.cash_registers(id) ON DELETE CASCADE;

-- Supprimer les triggers existants avant de les recréer
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_sales_invoices_updated_at ON public.sales_invoices;
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
DROP TRIGGER IF EXISTS update_catalog_updated_at ON public.catalog;
DROP TRIGGER IF EXISTS update_warehouse_stock_updated_at ON public.warehouse_stock;

-- Créer les triggers pour maintenir la cohérence
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_invoices_updated_at BEFORE UPDATE ON public.sales_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_updated_at BEFORE UPDATE ON public.catalog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_warehouse_stock_updated_at BEFORE UPDATE ON public.warehouse_stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
