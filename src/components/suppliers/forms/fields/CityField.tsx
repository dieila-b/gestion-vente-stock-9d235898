
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "../SupplierFormSchema";

// Function to get cities based on country
export const getCitiesByCountry = (country: string) => {
  // This is an expanded implementation with more countries
  const citiesByCountry: Record<string, string[]> = {
    "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
    "Maroc": ["Casablanca", "Rabat", "Fès", "Marrakech", "Agadir", "Tanger", "Meknès", "Oujda", "Kénitra", "Tétouan"],
    "États-Unis": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphie", "San Antonio", "San Diego", "Dallas", "San José"],
    "Royaume-Uni": ["Londres", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Bristol", "Édimbourg", "Sheffield", "Leeds", "Leicester"],
    "Canada": ["Toronto", "Montréal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Québec", "Winnipeg", "Hamilton", "Victoria"],
    "Allemagne": ["Berlin", "Hambourg", "Munich", "Cologne", "Francfort", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"],
    "Italie": ["Rome", "Milan", "Naples", "Turin", "Palerme", "Gênes", "Bologne", "Florence", "Bari", "Catane"],
    "Espagne": ["Madrid", "Barcelone", "Valence", "Séville", "Saragosse", "Malaga", "Murcie", "Palma", "Las Palmas", "Bilbao"],
    "Chine": ["Pékin", "Shanghai", "Canton", "Shenzhen", "Chengdu", "Tianjin", "Wuhan", "Xi'an", "Hangzhou", "Nanjing"],
    "Inde": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Calcutta", "Ahmedabad", "Pune", "Surat", "Jaipur"],
    "Japon": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kawasaki", "Hiroshima"],
    "Australie": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adélaïde", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Hobart"],
    "Brésil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
    "Russie": ["Moscou", "Saint-Pétersbourg", "Novossibirsk", "Iekaterinbourg", "Kazan", "Tcheliabinsk", "Omsk", "Samara", "Rostov-sur-le-Don", "Oufa"],
    "Mexique": ["Mexico", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Mérida", "Cancún"],
    "Afrique du Sud": ["Johannesburg", "Le Cap", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "Nelspruit", "Kimberley", "Polokwane", "Pietermaritzburg"],
    "Égypte": ["Le Caire", "Alexandrie", "Gizeh", "Choubra El Kheima", "Port-Saïd", "Suez", "Louxor", "Assouan", "Mansourah", "Tanta"],
    "Nigeria": ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba", "Jos"],
    "Ghana": ["Accra", "Kumasi", "Tamale", "Sekondi-Takoradi", "Sunyani", "Cape Coast", "Obuasi", "Tema", "Koforidua", "Ho"],
    "Sénégal": ["Dakar", "Touba", "Thiès", "Rufisque", "Kaolack", "Saint-Louis", "Ziguinchor", "Diourbel", "Louga", "Kolda"],
    "Algérie": ["Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif", "Sidi Bel Abbès", "Biskra"],
    "Tunisie": ["Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan", "Gabès", "Bizerte", "Aryanah", "Gafsa", "Monastir"],
    "Côte d'Ivoire": ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo", "Divo", "Man", "Gagnoa", "Abengourou"],
    "Belgique": ["Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges", "Namur", "Louvain", "Mons", "Courtrai"],
    "Suisse": ["Zurich", "Genève", "Bâle", "Lausanne", "Berne", "Winterthour", "Lucerne", "Saint-Gall", "Lugano", "Bienne"],
    "Portugal": ["Lisbonne", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Coimbra", "Funchal", "Setúbal", "Almada", "Agualva-Cacém"],
    "Cameroun": ["Douala", "Yaoundé", "Garoua", "Bamenda", "Maroua", "Bafoussam", "Ngaoundéré", "Bertoua", "Loum", "Kumba"],
    "Gabon": ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda", "Mouila", "Lambaréné", "Tchibanga", "Koulamoutou", "Makokou"],
  };

  return citiesByCountry[country] || ["Veuillez contacter le support pour ajouter des villes pour ce pays"];
};

interface CityFieldProps {
  form: UseFormReturn<SupplierFormValues>;
  watchedCountry: string;
  cities: string[];
}

export const CityField = ({ form, watchedCountry, cities }: CityFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="city"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ville</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
            disabled={!watchedCountry || cities.length === 0}
          >
            <FormControl>
              <SelectTrigger className="glass-effect">
                <SelectValue placeholder={!watchedCountry ? "Sélectionnez d'abord un pays" : "Sélectionnez une ville"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
