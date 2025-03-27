
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { toast } from "sonner";

interface PreorderData {
  clientId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  notes?: string;
}

export async function createPreorder(
  data: PreorderData,
  isEditing: boolean,
  editId: string | null
): Promise<any> {
  try {
    let preorder;
    
    if (isEditing && editId) {
      const { data: updatedPreorder, error: updateError } = await supabase
        .from('preorders')
        .update({
          client_id: data.clientId,
          total_amount: data.totalAmount,
          paid_amount: data.paidAmount,
          remaining_amount: data.remainingAmount,
          status: data.status,
          notes: data.notes
        })
        .eq('id', editId)
        .select()
        .single();
        
      if (updateError) throw updateError;
      preorder = updatedPreorder;
      
      const { error: deleteError } = await supabase
        .from('preorder_items')
        .delete()
        .eq('preorder_id', editId);
        
      if (deleteError) throw deleteError;
    } else {
      const { data: newPreorder, error: preorderError } = await supabase
        .from('preorders')
        .insert([{
          client_id: data.clientId,
          total_amount: data.totalAmount,
          paid_amount: data.paidAmount,
          remaining_amount: data.remainingAmount,
          status: data.status,
          notes: data.notes
        }])
        .select()
        .single();

      if (preorderError) throw preorderError;
      preorder = newPreorder;
    }
    
    return preorder;
  } catch (error) {
    console.error('Error creating/updating preorder:', error);
    throw error;
  }
}
