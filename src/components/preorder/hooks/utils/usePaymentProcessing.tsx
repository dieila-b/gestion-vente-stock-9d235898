
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { addCashRegisterTransaction } from "@/api/cash-register-api";

export async function processPayment(
  clientId: string,
  amount: number,
  paymentMethod: string,
  preorderId: string
): Promise<void> {
  if (amount <= 0) return;
  
  try {
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        client_id: clientId,
        amount: amount,
        payment_method: paymentMethod,
        notes: `Versement précommande ${preorderId}`
      }]);

    if (paymentError) throw paymentError;
    
    await updateCashRegister(clientId, amount, preorderId);
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

async function updateCashRegister(clientId: string, amount: number, preorderId: string): Promise<void> {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('company_name, contact_name')
      .eq('id', clientId)
      .single();
      
    if (clientError) throw clientError;
    
    const { data: cashRegister, error: cashRegisterError } = await supabase
      .from('cash_registers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (cashRegisterError) {
      console.error('Error fetching cash register:', cashRegisterError);
      return;
    }
    
    if (cashRegister && cashRegister.length > 0) {
      const clientName = clientData?.company_name || clientData?.contact_name || "Client";
      
      await addCashRegisterTransaction(
        cashRegister[0].id,
        'deposit',
        amount,
        `Encaissement précommande: ${clientName} (${preorderId.slice(0, 8).toUpperCase()})`
      );
    }
  } catch (error) {
    console.error('Error updating cash register:', error);
  }
}
