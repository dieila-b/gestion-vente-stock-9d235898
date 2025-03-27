
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReturnInvoiceSelectProps {
  clientId: string;
  invoiceId: string;
  filteredInvoices: {id: string, invoice_number: string}[];
  onInvoiceChange: (id: string) => void;
}

export function ReturnInvoiceSelect({ 
  clientId, 
  invoiceId, 
  filteredInvoices, 
  onInvoiceChange 
}: ReturnInvoiceSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="invoice_id">Facture associée (optionnel)</Label>
      <Select
        value={invoiceId}
        onValueChange={onInvoiceChange}
        disabled={!clientId}
      >
        <SelectTrigger>
          <SelectValue placeholder={!clientId ? "Sélectionnez d'abord un client" : "Sélectionner une facture"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no_invoice">Aucune facture</SelectItem>
          {filteredInvoices.map((invoice) => (
            <SelectItem key={invoice.id} value={invoice.id}>
              {invoice.invoice_number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {clientId && filteredInvoices.length === 0 && (
        <p className="text-sm text-amber-500">
          Aucune facture trouvée pour ce client.
        </p>
      )}
    </div>
  );
}
