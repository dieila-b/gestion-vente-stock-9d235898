
import { unwrapSupabaseObject, transformSupabaseResponse } from "@/utils/supabase-helpers";

/**
 * Un hook qui fournit des fonctions pour formater les réponses Supabase.
 * Aide à gérer les objets imbriqués et les tableaux que Supabase renvoie.
 */
export function useSupabaseFormatter() {
  /**
   * Accède en toute sécurité à une propriété imbriquée d'une réponse Supabase potentiellement imbriquée.
   * Gère les cas où la propriété peut être un tableau ou un objet direct.
   */
  function getNestedProperty<T>(obj: any, key: string): T | null {
    if (!obj) return null;
    
    const value = obj[key];
    return unwrapSupabaseObject<T>(value);
  }

  /**
   * Obtient en toute sécurité la valeur d'une propriété d'un objet qui pourrait être imbriqué sous forme de tableau.
   * C'est utile pour accéder aux propriétés des tables jointes dans les réponses Supabase.
   */
  function getPropertyValue<T>(obj: any, key: string, nestedKey?: string): T | null {
    const unwrappedObj = unwrapSupabaseObject(obj);
    if (!unwrappedObj) return null;
    
    if (nestedKey && typeof unwrappedObj === 'object') {
      const nestedObj = unwrapSupabaseObject(unwrappedObj[key]);
      return nestedObj ? (nestedObj[nestedKey] as T) : null;
    }
    
    return unwrappedObj[key] as T;
  }
  
  /**
   * Transforme une réponse Supabase complète en une structure plus facile à utiliser
   * en convertissant les tableaux d'objets imbriqués en objets directs.
   */
  function formatSupabaseResponse<T extends Record<string, any>>(response: T): T {
    return transformSupabaseResponse(response);
  }
  
  return {
    getNestedProperty,
    getPropertyValue,
    unwrapSupabaseObject,
    formatSupabaseResponse
  };
}
