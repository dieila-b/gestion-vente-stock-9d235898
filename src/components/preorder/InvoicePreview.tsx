
import React from 'react';
import { CartItem } from '@/types/pos';
import { Client } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Printer, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface InvoicePreviewProps {
  client: Client | null;
  cart: CartItem[];
  notes: string;
  onNotesChange: (notes: string) => void;
  onValidate: () => void;
  isSubmitting: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  client,
  cart,
  notes,
  onNotesChange,
  onValidate,
  isSubmitting,
}) => {
  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.quantity * (item.discounted_price || item.price),
      0
    );
  };

  const handlePrint = () => {
    // This would normally print the invoice, but for now we'll just show a toast
    toast.info("Impression non implémentée pour le moment");
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Aperçu de la précommande</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-6">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold text-base mb-1">PRÉCOMMANDE</h3>
              <p>Date: {format(new Date(), "PPP", { locale: fr })}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">N° Précommande: [Automatique]</p>
              <p>Validité: 7 jours</p>
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <h4 className="font-medium mb-1">DE:</h4>
              <p>Votre Entreprise</p>
              <p>Adresse de l'entreprise</p>
              <p>Téléphone: xxx-xxx-xxxx</p>
              <p>Email: contact@votreentreprise.com</p>
            </div>
            <div className="text-right">
              <h4 className="font-medium mb-1">POUR:</h4>
              {client ? (
                <>
                  <p>{client.company_name || 'Client particulier'}</p>
                  {client.contact_name && <p>{client.contact_name}</p>}
                  {client.phone && <p>Tél: {client.phone}</p>}
                  {client.email && <p>{client.email}</p>}
                </>
              ) : (
                <p className="text-muted-foreground italic">Aucun client sélectionné</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">ARTICLES:</h4>
            {cart.length === 0 ? (
              <p className="text-muted-foreground italic">Aucun article ajouté</p>
            ) : (
              <div className="border rounded-md">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Produit</th>
                      <th className="p-2 text-right">Prix Unit.</th>
                      <th className="p-2 text-right">Qté</th>
                      <th className="p-2 text-right">Remise</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-muted-foreground">
                            {item.reference && `Réf: ${item.reference}`}
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          {item.price.toLocaleString('fr-FR')} GNF
                        </td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          {item.discount ? `${item.discount}%` : '-'}
                        </td>
                        <td className="p-2 text-right">
                          {(
                            item.quantity *
                            (item.discounted_price || item.price)
                          ).toLocaleString('fr-FR')}{' '}
                          GNF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">TOTAL:</span>
              <span className="font-medium">
                {calculateTotal().toLocaleString('fr-FR')} GNF
              </span>
            </div>
            <Separator />
          </div>

          <div>
            <h4 className="font-medium mb-2">NOTES:</h4>
            <Textarea
              placeholder="Notes additionnelles pour la précommande..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={cart.length === 0 || !client}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button
              onClick={onValidate}
              disabled={cart.length === 0 || !client || isSubmitting}
            >
              {isSubmitting ? (
                "Validation en cours..."
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Valider la précommande
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicePreview;
