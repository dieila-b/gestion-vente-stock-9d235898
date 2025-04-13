
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GeographicZone } from '@/types/geographic-zone';

export const useGeographicZones = () => {
  const [zones, setZones] = useState<GeographicZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<GeographicZone | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('geographic_zones')
        .select('*')
        .order('name');

      if (error) throw error;
      setZones(data || []);
    } catch (error: any) {
      console.error('Error fetching zones:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les zones géographiques',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      let error;
      
      if (data.id) {
        // Update
        const { error: updateError } = await supabase
          .from('geographic_zones')
          .update({ 
            name: data.name,
            type: data.type,
            parent_id: data.parent_id || null, // Ensure parent_id is null if empty
          })
          .eq('id', data.id);
        
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('geographic_zones')
          .insert({ 
            name: data.name,
            type: data.type,
            parent_id: data.parent_id || null, // Ensure parent_id is null if empty
          });
        
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Succès',
        description: data.id ? 'Zone mise à jour avec succès' : 'Zone créée avec succès',
      });

      setIsAddDialogOpen(false);
      setSelectedZone(null);
      fetchZones();
    } catch (error: any) {
      console.error('Error saving zone:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la zone géographique',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('geographic_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Zone supprimée avec succès',
      });

      fetchZones();
    } catch (error: any) {
      console.error('Error deleting zone:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer la zone. Assurez-vous qu'elle n'est pas utilisée ailleurs.",
        variant: 'destructive',
      });
    }
  };

  const getZoneTypeName = (type: string): string => {
    const types: Record<string, string> = {
      country: 'Pays',
      state: 'État/Province',
      city: 'Ville',
      district: 'Quartier',
      warehouse_zone: "Zone d'entrepôt",
    };
    return types[type] || type;
  };

  const getParentName = (parentId: string | null): string => {
    if (!parentId) return '';
    const parent = zones.find(z => z.id === parentId);
    return parent ? parent.name : '';
  };

  // Get zones that can be parents (not including the currently selected zone)
  const parentZones = selectedZone 
    ? zones.filter(zone => zone.id !== selectedZone.id) 
    : zones;

  return {
    zones,
    isLoading,
    selectedZone,
    setSelectedZone,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    getZoneTypeName,
    getParentName,
    parentZones,
  };
};
