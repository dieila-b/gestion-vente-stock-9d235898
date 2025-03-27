
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserPlus, Printer } from "lucide-react";
import { Client } from "@/types/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ClientsHeaderProps {
  setIsAddClientOpen: (value: boolean) => void;
  clients?: Client[];
}

export const ClientsHeader = ({ setIsAddClientOpen, clients }: ClientsHeaderProps) => {
  const handlePrintAllClients = () => {
    if (!clients?.length) {
      toast.error("Aucun client à imprimer");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Liste des Clients", 105, 15, { align: "center" });

      const tableData = clients.map(client => [
        client.client_code || "-",
        client.contact_name,
        client.phone || client.mobile_1 || client.mobile_2 || client.whatsapp || "-",
        client.client_type || "occasionnel",
        client.address || "-",
      ]);

      autoTable(doc, {
        head: [["Code", "Contact", "Téléphone", "Type", "Adresse"]],
        body: tableData,
        startY: 25,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save('liste-clients.pdf');
      toast.success("La liste des clients a été générée avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération de la liste:", error);
      toast.error("Erreur lors de la génération de la liste des clients");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">
            Nos Clients
          </h1>
          <p className="text-muted-foreground">
            Gérez vos clients et leurs informations
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline"
          className="enhanced-glass"
          onClick={handlePrintAllClients}
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimer la liste
        </Button>

        <Button 
          className="enhanced-glass"
          onClick={() => setIsAddClientOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nouveau Client
        </Button>
      </div>
    </motion.div>
  );
};
