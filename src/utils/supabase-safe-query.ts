
// This file now re-exports all data safety utilities from the new modular structure
// It maintains backward compatibility for existing imports
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { db } from "./db-core";
import { BankAccount, DeliveryNote, Supplier, SelectQueryError } from "@/types/db-adapter";

// Re-export everything from the new modular files
export * from './data-safe';
