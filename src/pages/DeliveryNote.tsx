
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchDeliveryNote } from "@/hooks/delivery-notes/use-fetch-delivery-note";
import { DeliveryNoteView } from "@/components/delivery-notes/DeliveryNoteView";
import { EditDeliveryNote } from "@/components/delivery-notes/EditDeliveryNote";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeliveryNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: deliveryNote, isLoading, error } = useFetchDeliveryNote(id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails du bon de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-40" />
              <Skeleton className="w-full h-12" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !deliveryNote) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger les détails du bon de livraison.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/delivery-notes')}
              className="mt-4"
            >
              Retour aux bons de livraison
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Détails du bon de livraison</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isEditing ? (
            <EditDeliveryNote deliveryNote={deliveryNote} onClose={() => setIsEditing(false)} />
          ) : (
            <DeliveryNoteView deliveryNote={deliveryNote} />
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/delivery-notes')}>
              Retour aux bons de livraison
            </Button>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
