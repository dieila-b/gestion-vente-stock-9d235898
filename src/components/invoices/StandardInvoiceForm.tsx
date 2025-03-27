
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Printer } from "lucide-react";
import { toast } from "sonner";

interface StandardInvoiceFormProps {
  onClose: () => void;
}

export const StandardInvoiceForm = ({ onClose }: StandardInvoiceFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Facture en cours de création...", {
      description: "Cette fonctionnalité sera bientôt disponible"
    });
  };

  return (
    <Card className="enhanced-glass p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gradient">Facture Standard</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Date d'émission</label>
            <Input
              type="date"
              className="enhanced-glass"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Date d'échéance</label>
            <Input
              type="date"
              className="enhanced-glass"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Conditions de paiement</label>
          <Input
            className="enhanced-glass"
            placeholder="Net 30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Mode de paiement</label>
          <Input
            className="enhanced-glass"
            placeholder="Virement bancaire"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Notes</label>
          <Textarea
            className="enhanced-glass min-h-[100px]"
            placeholder="Notes ou conditions particulières..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            type="submit"
            className="enhanced-glass hover:scale-105 transition-transform duration-300"
          >
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
          <Button 
            type="button"
            variant="outline"
            className="enhanced-glass hover:scale-105 transition-transform duration-300"
            onClick={() => {
              onClose();
              toast.success("Prévisualisation disponible bientôt");
            }}
          >
            <Printer className="mr-2 h-4 w-4" />
            Prévisualiser
          </Button>
        </div>
      </form>
    </Card>
  );
};
