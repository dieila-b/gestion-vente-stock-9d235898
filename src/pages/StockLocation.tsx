
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GeographicZonesHeader } from "@/components/geographic-zones/GeographicZonesHeader";
import { GeographicZoneForm } from "@/components/geographic-zones/GeographicZoneForm";
import { GeographicZonesTable } from "@/components/geographic-zones/GeographicZonesTable";
import { useGeographicZones } from "@/hooks/use-geographic-zones";

const StockLocation = () => {
  const {
    zones,
    parentZones,
    selectedZone,
    setSelectedZone,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    getZoneTypeName,
    getParentName
  } = useGeographicZones();

  const handleAddClick = () => {
    setSelectedZone(null);
    setIsAddDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <GeographicZonesHeader onAddClick={handleAddClick} />

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedZone ? "Modifier la zone" : "Nouvelle zone géographique"}
              </DialogTitle>
            </DialogHeader>
            <GeographicZoneForm
              selectedZone={selectedZone}
              parentZones={parentZones}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsAddDialogOpen(false);
                setSelectedZone(null);
              }}
              getZoneTypeName={getZoneTypeName}
            />
          </DialogContent>
        </Dialog>

        <Card className="p-6">
          <GeographicZonesTable
            zones={zones}
            onEdit={(zone) => {
              setSelectedZone(zone);
              setIsAddDialogOpen(true);
            }}
            onDelete={handleDelete}
            getZoneTypeName={getZoneTypeName}
            getParentName={getParentName}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StockLocation;
