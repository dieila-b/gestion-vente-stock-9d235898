
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatGNF } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";
import { safeFetchRecordById, safeFetchFromTable } from "@/utils/supabase-safe-query";

interface InvoicePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  remainingAmount: number;
  onPaymentComplete: () => void;
}

export function InvoicePaymentDialog({
  isOpen,
  onClose,
  invoiceId,
  remainingAmount,
  onPaymentComplete
}: InvoicePaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (parseFloat(amount) > remainingAmount) {
      toast.error("Le montant ne peut pas dépasser le solde restant");
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentAmount = parseFloat(amount);

      // Insert payment record - use safe function in case the table doesn't exist yet
      await safeFetchFromTable(
        'invoice_payments',
        query => query.insert({
          invoice_id: invoiceId,
          amount: paymentAmount,
          payment_method: paymentMethod,
          notes,
        }),
        [],
        "Erreur lors de l'enregistrement du paiement"
      );

      // Fetch current invoice data
      const invoice = await safeFetchRecordById(
        'invoices',
        invoiceId,
        q => q,
        { paid_amount: 0, remaining_amount: remainingAmount },
        "Erreur lors de la récupération de la facture"
      );

      const newPaidAmount = (invoice?.paid_amount || 0) + paymentAmount;
      const newRemainingAmount = (invoice?.remaining_amount || remainingAmount) - paymentAmount;
      const newPaymentStatus = newRemainingAmount === 0 ? 'paid' : 'partial';

      // Update the invoice
      await safeFetchFromTable(
        'invoices',
        query => query.update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          payment_status: newPaymentStatus
        }).eq('id', invoiceId),
        [],
        "Erreur lors de la mise à jour de la facture"
      );

      toast.success("Paiement enregistré avec succès");
      onPaymentComplete();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      toast.error("Erreur lors de l'enregistrement du paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            Solde restant : {formatGNF(remainingAmount)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              max={remainingAmount}
              className="enhanced-glass"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Méthode de paiement</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="enhanced-glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes additionnelles..."
              className="enhanced-glass"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="enhanced-glass"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="enhanced-glass"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
