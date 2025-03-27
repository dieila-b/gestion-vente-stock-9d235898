
import { supabase } from "@/integrations/supabase/client";
import { addCashRegisterTransaction } from "@/api/cash-register-api";

export async function updateCashRegister(invoice: any, amount: number) {
  const { data: cashRegisters, error: cashRegisterError } = await supabase
    .from('cash_registers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (cashRegisterError) throw cashRegisterError;

  if (cashRegisters && cashRegisters.length > 0) {
    const cashRegister = cashRegisters[0];
    const invoiceId = invoice.id.slice(0, 8).toUpperCase();
    
    await addCashRegisterTransaction(
      cashRegister.id,
      'deposit',
      amount,
      `Règlement Facture (${invoiceId})`
    );
  }
}
