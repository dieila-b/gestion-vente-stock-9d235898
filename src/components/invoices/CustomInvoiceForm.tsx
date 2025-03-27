
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, FileText, Printer, Upload } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface CustomInvoiceFormProps {
  onClose: () => void;
}

export const CustomInvoiceForm = ({ onClose }: CustomInvoiceFormProps) => {
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Facture personnalisée créée avec succès !");
  };

  return (
    <Card className="enhanced-glass p-6 space-y-6 animate-fade-in transform hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Facture Personnalisée
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">En-tête personnalisé</label>
            <div className="h-32 enhanced-glass rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
              {logo ? (
                <img src={logo} alt="Logo" className="h-full object-contain p-2" />
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors"
                  >
                    Ajouter votre logo
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Informations entreprise</label>
            <Textarea
              className="enhanced-glass min-h-[128px] resize-none"
              placeholder="Nom de l'entreprise&#10;Adresse&#10;Téléphone&#10;Email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Mention légale personnalisée</label>
          <Input
            className="enhanced-glass"
            placeholder="Ex: RCS Paris B 000 000 000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Pied de page personnalisé</label>
          <Textarea
            className="enhanced-glass min-h-[80px]"
            placeholder="Message de remerciement ou informations complémentaires..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            type="submit"
            className="enhanced-glass hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-purple-500 to-pink-600"
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
          <Button 
            type="button"
            variant="outline"
            className="enhanced-glass hover:scale-105 transition-transform duration-300"
            onClick={() => {
              toast.info("Prévisualisation en cours de préparation...");
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
