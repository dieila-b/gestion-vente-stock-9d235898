
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PackageX, Package } from "lucide-react";
import { CustomerReturn } from "@/types/customer-return";
import CustomerReturnListItem from "./CustomerReturnListItem";

interface ReturnTableProps {
  returns: CustomerReturn[];
  searchTerm: string;
  onOpenNewReturn: () => void;
  onRefresh: () => void;
}

export function ReturnTable({ returns, searchTerm, onOpenNewReturn, onRefresh }: ReturnTableProps) {
  const filteredReturns = returns.filter(
    (ret) =>
      ret.return_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.invoice?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.returned_items?.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Table>
      <TableHeader className="bg-black/20 rounded-md">
        <TableRow className="border-b-purple-500/20 hover:bg-transparent">
          <TableHead className="text-indigo-200">N° Retour</TableHead>
          <TableHead className="text-indigo-200">Date</TableHead>
          <TableHead className="text-indigo-200">Client</TableHead>
          <TableHead className="text-indigo-200">Facture associée</TableHead>
          <TableHead className="text-indigo-200">Articles retournés</TableHead>
          <TableHead className="text-indigo-200">Motif</TableHead>
          <TableHead className="text-indigo-200">Montant</TableHead>
          <TableHead className="text-indigo-200">Statut</TableHead>
          <TableHead className="text-indigo-200 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredReturns.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-40 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <PackageX className="h-14 w-14 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground text-lg">
                  Aucun retour client trouvé
                </p>
                <p className="text-muted-foreground/70 text-sm max-w-md">
                  Aucun retour client ne correspond à votre recherche. Essayez de modifier vos critères ou créez un nouveau retour.
                </p>
                <Button variant="outline" onClick={onOpenNewReturn} className="mt-3 bg-white/5 hover:bg-white/10 border-purple-500/30">
                  <Package className="mr-2 h-4 w-4" />
                  Créer un retour
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          filteredReturns.map((ret) => (
            <CustomerReturnListItem key={ret.id} customerReturn={ret} onRefresh={onRefresh} />
          ))
        )}
      </TableBody>
    </Table>
  );
}
