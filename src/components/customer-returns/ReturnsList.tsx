
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter,
  RefreshCw, 
  PackageX 
} from "lucide-react";
import { CustomerReturn } from "@/types/customer-return";
import { ReturnTable } from "./ReturnTable";

interface ReturnsListProps {
  returns: CustomerReturn[];
  isLoading: boolean;
  onRefresh: () => void;
  onNewReturn: () => void;
}

export function ReturnsList({ returns, isLoading, onRefresh, onNewReturn }: ReturnsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-muted-foreground">Chargement des retours clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-indigo-400">Retours Clients</h1>
          <p className="text-muted-foreground mt-1">Gérez les retours de marchandises des clients</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={onRefresh} className="h-10 w-10">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Actualiser</span>
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filtrer</span>
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-72 border-purple-500/30 focus:border-purple-500/60"
            />
          </div>
          <Button onClick={onNewReturn} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0">
            <PackageX className="mr-2 h-4 w-4" />
            Nouveau retour
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-indigo-950/40 to-purple-950/30 border-purple-500/30 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl font-medium text-white/90">Liste des retours</CardTitle>
          <CardDescription>
            {returns.length} retour{returns.length !== 1 ? 's' : ''} trouvé{returns.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ReturnTable 
            returns={returns} 
            searchTerm={searchTerm} 
            onOpenNewReturn={onNewReturn}
            onRefresh={onRefresh}
          />
        </CardContent>
      </Card>
    </div>
  );
}
