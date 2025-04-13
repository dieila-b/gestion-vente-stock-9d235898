
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditUserDialog } from "./EditUserDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface UserActionsMenuProps {
  user: User;
}

export function UserActionsMenu({ user }: UserActionsMenuProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowEditDialog(true)}
          className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
        >
          <Edit className="h-4 w-4 mr-1" />
          Éditer
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDeleteDialog(true)}
          className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </div>

      {showEditDialog && (
        <EditUserDialog 
          user={user} 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog} 
        />
      )}

      {showDeleteDialog && (
        <DeleteUserDialog 
          user={user} 
          open={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog} 
        />
      )}
    </>
  );
}
