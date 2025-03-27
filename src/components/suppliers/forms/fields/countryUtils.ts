
// Mapping des pays avec leurs indicatifs téléphoniques
export const countryPhoneCodes: Record<string, string> = {
  "France": "+33",
  "Maroc": "+212",
  "États-Unis": "+1",
  "Royaume-Uni": "+44",
  "Canada": "+1",
  "Allemagne": "+49",
  "Italie": "+39",
  "Espagne": "+34",
  "Chine": "+86",
  "Inde": "+91",
  "Japon": "+81",
  "Australie": "+61",
  "Brésil": "+55",
  "Russie": "+7",
  "Mexique": "+52",
  "Afrique du Sud": "+27",
  "Égypte": "+20",
  "Nigeria": "+234",
  "Ghana": "+233",
  "Sénégal": "+221",
  "Algérie": "+213",
  "Tunisie": "+216",
  "Côte d'Ivoire": "+225",
  "Belgique": "+32",
  "Suisse": "+41",
  "Portugal": "+351",
  "Cameroun": "+237",
  "Gabon": "+241",
  "Guinée": "+224",
};

// Fonction pour obtenir l'indicatif téléphonique d'un pays
export const getPhoneCodeForCountry = (country: string): string => {
  return countryPhoneCodes[country] || "";
};
