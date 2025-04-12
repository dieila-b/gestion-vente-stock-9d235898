
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchDeliveryNotes } from "@/hooks/use-delivery-notes";
import type { DeliveryNote as DeliveryNoteType } from "@/types/delivery-note";
import { EditDeliveryNote } from "@/components/delivery-notes/EditDeliveryNote";
import { DeliveryNoteView } from "@/components/delivery-notes/DeliveryNoteView";

export default function DeliveryNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNoteType | null>(null);
  const { data: deliveryNotes, isLoading } = useFetchDeliveryNotes();

  useEffect(() => {
    if (deliveryNotes && id) {
      const foundNote = deliveryNotes.find((note) => note.id === id);
      if (foundNote) {
        setDeliveryNote(foundNote);
      } else {
        console.log("Delivery note not found");
        navigate('/delivery-notes');
      }
    }
  }, [deliveryNotes, id, navigate]);

  if (isLoading) {
    return <div>Loading delivery note...</div>;
  }

  if (!deliveryNote) {
    return <div>Delivery note not found.</div>;
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
