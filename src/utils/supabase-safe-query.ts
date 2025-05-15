
export function safeProduct(product: any) {
  // Guard against product being undefined or null
  if (!product) {
    return { 
      id: '',
      name: 'Produit inconnu',
      reference: '',
      category: ''
    };
  }
  
  // Check if product is an error object from Supabase
  if (isSelectQueryError(product)) {
    return { 
      id: '',
      name: 'Erreur de chargement',
      reference: '',
      category: ''
    };
  }
  
  // Return the product if it's valid
  return product;
}

function isSelectQueryError(obj: any): boolean {
  return (
    obj !== null &&
    typeof obj === "object" &&
    obj.hasOwnProperty("code") &&
    obj.hasOwnProperty("message") &&
    obj.hasOwnProperty("details")
  );
}

export function safePOSLocation(location: any) {
  if (!location) {
    return { 
      id: '',
      name: 'Emplacement inconnu'
    };
  }
  
  if (isSelectQueryError(location)) {
    return { 
      id: '',
      name: 'Erreur de chargement'
    };
  }
  
  return location;
}
