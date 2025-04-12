import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Pencil, Printer, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { CartItem } from "@/types/pos";
import { formatGNF } from "@/lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { addCashRegisterTransaction } from "@/api/cash-register-api";

interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier_id: string;
  total_amount: number;
  tax_amount: number;
  payment_status: string;
  due_date: string;
  created_at: string;
  paid_amount: number;
  remaining_amount: number;
  approved_at: string | null;
  shipping_cost: number;
  supplier: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  purchase_order: {
    order_number: string;
  };
  delivery_note: {
    delivery_number: string;
  };
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PurchaseInvoice;
  onPaymentComplete: () => void;
}

const PaymentDialog = ({ isOpen, onClose, invoice, onPaymentComplete }: PaymentDialogProps) => {
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

    if (parseFloat(amount) > invoice.remaining_amount) {
      toast.error("Le montant ne peut pas dépasser le solde restant");
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentAmount = parseFloat(amount);
      
      // Update the invoice first
      const newPaidAmount = (invoice.paid_amount || 0) + paymentAmount;
      const newRemainingAmount = invoice.total_amount - newPaidAmount;
      const newPaymentStatus = newRemainingAmount === 0 ? 'paid' : 'partial';

      const { error: updateError } = await supabase
        .from('purchase_invoices')
        .update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          payment_status: newPaymentStatus
        })
        .eq('id', invoice.id);

      if (updateError) throw updateError;

      // Then create the payment entry
      const { error: paymentError } = await supabase
        .from('purchase_invoice_payments')
        .insert({
          invoice_id: invoice.id,
          amount: paymentAmount,
          payment_method: paymentMethod,
          notes,
          payment_date: new Date().toISOString()
        });

      if (paymentError) throw paymentError;

      // Get active cash register for withdrawal
      const { data: cashRegisters, error: cashRegisterError } = await supabase
        .from('cash_registers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (cashRegisterError) throw cashRegisterError;

      if (cashRegisters && cashRegisters.length > 0) {
        const cashRegister = cashRegisters[0];
        
        // Add withdrawal transaction to cash register
        await addCashRegisterTransaction(
          cashRegister.id,
          'withdrawal', // Use withdrawal for purchase invoice payments
          paymentAmount,
          `Règlement Facture Achat (${invoice.invoice_number})`
        );
      }

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
            Solde restant : {formatGNF(invoice.remaining_amount)}
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
              max={invoice.remaining_amount}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Méthode de paiement</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
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
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PurchaseInvoicePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PurchaseInvoice | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<PurchaseInvoice | null>(null);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['purchase-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(name, contact, email, phone),
          purchase_order:purchase_orders(order_number),
          delivery_note:delivery_notes(delivery_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PurchaseInvoice[];
    }
  });

  const handleEdit = async (invoice: PurchaseInvoice) => {
    setEditingInvoice(invoice);
    setShowEditDialog(true);
  };

  const handlePayment = (invoice: PurchaseInvoice) => {
    setSelectedInvoiceForPayment(invoice);
    setShowPaymentDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice) return;

    try {
      const { error } = await supabase
        .from('purchase_invoices')
        .update({
          shipping_cost: editingInvoice.shipping_cost
        })
        .eq('id', editingInvoice.id);

      if (error) throw error;

      toast.success("La facture a été mise à jour avec succès");
      setShowEditDialog(false);
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("La facture a été supprimée avec succès");
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
    }
  };

  const handlePrint = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
  };

  const formatItemsForInvoice = (invoice: PurchaseInvoice): CartItem[] => {
    return [{
      id: invoice.id,
      name: `${invoice.invoice_number} - ${invoice.supplier.name}`,
      quantity: 1,
      price: invoice.total_amount,
      category: "default",
      discount: 0
    }];
  };

  const filteredInvoices = invoices?.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-between md:flex-row gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">Factures d'achat</h1>
            <p className="text-muted-foreground">Gérez vos factures d'achat fournisseurs</p>
          </div>
          <div>
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">N° Facture</TableHead>
                <TableHead className="text-left">Date</TableHead>
                <TableHead className="text-left">Fournisseur</TableHead>
                <TableHead className="text-left">N° Commande</TableHead>
                <TableHead className="text-left">N° Livraison</TableHead>
                <TableHead className="text-right">Montant TTC</TableHead>
                <TableHead className="text-right">Payé</TableHead>
                <TableHead className="text-right">Reste</TableHead>
                <TableHead className="text-left">Statut</TableHead>
                <TableHead className="text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : filteredInvoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">Aucune facture trouvée</TableCell>
                </TableRow>
              ) : (
                filteredInvoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="text-left font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell className="text-left">
                      {format(new Date(invoice.created_at), "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-left">{invoice.supplier.name}</TableCell>
                    <TableCell className="text-left">{invoice.purchase_order?.order_number}</TableCell>
                    <TableCell className="text-left">{invoice.delivery_note?.delivery_number}</TableCell>
                    <TableCell className="text-right font-semibold">{formatGNF(invoice.total_amount)}</TableCell>
                    <TableCell className="text-right">{formatGNF(invoice.paid_amount)}</TableCell>
                    <TableCell className="text-right">{formatGNF(invoice.remaining_amount)}</TableCell>
                    <TableCell className="text-left">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.payment_status === 'paid' ? 'Payé' :
                         invoice.payment_status === 'partial' ? 'Partiel' : 
                         'En attente'}
                      </span>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                        {invoice.payment_status !== 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handlePayment(invoice)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => handleEdit(invoice)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
                          onClick={() => handlePrint(invoice)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {invoice.payment_status !== 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog pour l'impression */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-4xl">
          {selectedInvoice && (
            <DynamicInvoice
              invoiceNumber={selectedInvoice.invoice_number}
              items={formatItemsForInvoice(selectedInvoice)}
              subtotal={selectedInvoice.total_amount}
              total={selectedInvoice.total_amount + selectedInvoice.tax_amount}
              discount={0}
              shipping_cost={selectedInvoice.shipping_cost}
              date={format(new Date(selectedInvoice.created_at), "dd/MM/yyyy", { locale: fr })}
              clientName={selectedInvoice.supplier.name}
              clientEmail={selectedInvoice.supplier.email}
              onDownload={() => setSelectedInvoice(null)}
              supplierNumber={selectedInvoice.supplier_id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour l'édition */}
      <Dialog open={showEditDialog} onOpenChange={() => setShowEditDialog(false)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Éditer la facture</DialogTitle>
            <DialogDescription>
              Modifier les informations de la facture
            </DialogDescription>
          </DialogHeader>
          {editingInvoice && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium">Frais de transport</label>
                <Input 
                  type="number"
                  value={editingInvoice.shipping_cost}
                  onChange={(e) => {
                    setEditingInvoice({
                      ...editingInvoice,
                      shipping_cost: parseFloat(e.target.value)
                    });
                  }}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  variant="destructive"
                  onClick={() => setShowEditDialog(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour le paiement */}
      {selectedInvoiceForPayment && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => {
            setShowPaymentDialog(false);
            setSelectedInvoiceForPayment(null);
          }}
          invoice={selectedInvoiceForPayment}
          onPaymentComplete={refetch}
        />
      )}
    </DashboardLayout>
  );
};

export default PurchaseInvoicePage;
