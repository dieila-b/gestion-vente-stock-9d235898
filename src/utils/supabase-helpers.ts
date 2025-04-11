
/**
 * Unwraps a potentially nested object from Supabase query responses.
 * Supabase sometimes returns nested objects as arrays with a single element when using joins.
 * 
 * @param obj The potentially nested object or array from a Supabase query
 * @returns The unwrapped object or null if not found
 */
export function unwrapSupabaseObject<T>(obj: T | T[] | null | undefined): T | null {
  if (!obj) return null;
  
  // Si c'est un tableau avec un ou plusieurs éléments, retourner le premier élément
  if (Array.isArray(obj) && obj.length > 0) {
    return obj[0];
  }
  
  // Sinon retourner l'objet lui-même
  return obj as T;
}

/**
 * Maps properties from a nested Supabase response to a flattened object.
 * Handles the case where Supabase returns some related objects as arrays.
 * 
 * @param data The response data from Supabase with nested objects
 * @param mappingFn A function that maps the data to the desired format
 * @returns An array of mapped objects
 */
export function mapSupabaseData<T, R>(
  data: T[] | null, 
  mappingFn: (item: T) => R
): R[] {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(mappingFn);
}

/**
 * Recursive function to transform a nested Supabase response where foreign key relations
 * are returned as arrays into a more usable format with direct object references.
 * 
 * @param obj The object to transform
 * @returns A transformed object with unwrapped nested objects
 */
export function transformSupabaseResponse<T extends Record<string, any>>(obj: T): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Créer un nouvel objet pour stocker le résultat
  const result: Record<string, any> = {};
  
  // Parcourir toutes les propriétés de l'objet
  for (const [key, value] of Object.entries(obj)) {
    // Si la valeur est un tableau avec un seul élément et contient des objets (relation)
    if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'object') {
      // Transformer récursivement l'élément unique du tableau
      result[key] = transformSupabaseResponse(value[0]);
    } 
    // Si c'est un tableau avec plusieurs éléments
    else if (Array.isArray(value) && value.length > 0) {
      // Transformer chaque élément du tableau
      result[key] = value.map(item => 
        typeof item === 'object' ? transformSupabaseResponse(item) : item
      );
    } 
    // Si c'est un objet (mais pas un tableau ni null)
    else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Transformer récursivement l'objet
      result[key] = transformSupabaseResponse(value);
    } 
    // Sinon, conserver la valeur telle quelle
    else {
      result[key] = value;
    }
  }
  
  return result as T;
}

/**
 * Helper to safely access a property that might be an array in Supabase response
 * 
 * @param obj The object or array containing the property
 * @param key The property name to access
 * @returns The property value
 */
export function getNestedProperty<T>(obj: any, key: string): T | null {
  if (!obj) return null;
  
  const value = obj[key];
  return unwrapSupabaseObject<T>(value);
}
