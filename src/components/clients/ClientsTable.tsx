import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Printer } from "lucide-react";
import { Client } from "@/types/client";
import { generateClientPDF } from "@/lib/generateClientPDF";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientsTableProps {
  filteredClients?: Client[];
  isLoading: boolean;
  setSelectedClient: (client: Client) => void;
}

export const ClientsTable = ({ 
  filteredClients, 
  isLoading, 
  setSelectedClient 
}: ClientsTableProps) => {
  const handlePrintClient = (client: Client) => {
    try {
      generateClientPDF(client);
      toast.success("Le PDF a été généré avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  // Get client phone number with fallbacks
  const getClientPhone = (client: Client) => {
    return client.phone || client.mobile_1 || client.whatsapp || '-';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-md border enhanced-glass"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Nom du contact</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                Chargement...
              </TableCell>
            </TableRow>
          ) : filteredClients?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                Aucun client trouvé
              </TableCell>
            </TableRow>
          ) : (
            filteredClients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.client_code}</TableCell>
                <TableCell>{client.contact_name}</TableCell>
                <TableCell>{getClientPhone(client)}</TableCell>
                <TableCell>{client.client_type || 'occasionnel'}</TableCell>
                <TableCell>{client.address || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClient(client)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintClient(client)}
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
};
