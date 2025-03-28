import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { MapPin, Users, Warehouse, Settings as SettingsIcon, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*");
      
      if (error) throw error;
      return data;
    }
  });

  const settingsGroups = [
    {
      title: "Zone Géographie",
      description: "Gérez les emplacements, régions et zones géographiques",
      icon: MapPin,
      link: "/stock-location",
      color: "from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30"
    },
    {
      title: "Fournisseurs",
      description: "Gérez vos fournisseurs et leurs catalogues",
      icon: Users,
      link: "/suppliers",
      color: "from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30"
    },
    {
      title: "Dépôts de stockage",
      description: "Gérez vos entrepôts et zones de stockage",
      icon: Warehouse,
      link: "/warehouses",
      color: "from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30"
    },
    {
      title: "Dépôts PDV",
      description: "Gérez vos points de vente",
      icon: Store,
      link: "/pos-locations",
      color: "from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30"
    },
    {
      title: "Clients",
      description: "Gérez vos clients et leurs informations",
      icon: Users,
      link: "/clients",
      color: "from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-primary/10">
            <SettingsIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              Paramètres
            </h1>
            <p className="text-muted-foreground">
              Espace administrateur
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 perspective-1000">
          {settingsGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, rotateX: -30, y: 50 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={group.link}>
                <Card className={`
                  p-6 
                  hover:shadow-xl 
                  transition-all 
                  duration-300 
                  cursor-pointer 
                  group 
                  hover:scale-[1.02]
                  bg-gradient-to-br 
                  ${group.color}
                  backdrop-blur-sm
                  border-0
                  relative
                  overflow-hidden
                `}>
                  <div className="absolute inset-0 bg-grid-white/10 bg-gradient-to-br from-white/5 to-white/0" />
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                        <group.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-white">{group.title}</h3>
                        <p className="text-sm text-white/70">
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
