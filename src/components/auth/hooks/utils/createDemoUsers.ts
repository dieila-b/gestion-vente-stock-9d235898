
/**
 * Creates demo users in localStorage for development mode
 */
export const createDemoUsers = (): void => {
  try {
    const existingUsers = localStorage.getItem('internalUsers');
    if (!existingUsers) {
      const demoUsers = [
        {
          id: "dev-1743844624581",
          first_name: "Dieila",
          last_name: "Barry",
          email: "wosyrab@gmail.com",
          phone: "623268781",
          address: "Matam",
          role: "admin",
          is_active: true,
          photo_url: null
        },
        {
          id: "dev-1743853323494",
          first_name: "Dieila",
          last_name: "Barry",
          email: "wosyrab@yahoo.fr",
          phone: "623268781",
          address: "Madina",
          role: "manager",
          is_active: true,
          photo_url: null
        }
      ];
      localStorage.setItem('internalUsers', JSON.stringify(demoUsers));
      console.log("Données utilisateurs de démo créées et stockées dans localStorage");
    } else {
      console.log("Utilisateurs de démonstration existants trouvés dans localStorage");
    }
  } catch (err) {
    console.error("Erreur lors de la création des données démo:", err);
  }
};
