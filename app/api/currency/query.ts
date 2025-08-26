import { getSupabaseSession } from "@/lib/authMnager";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export const creerCurrency = async (currencyData: Record<string, any>) => {
    const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
      .from('settings')
      .insert([currencyData]);

    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
};

export const getAllCurrency = async () => {
      const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
  } catch (err) {
    throw err;
  }
};

export const supprimerCurrency = async (id: any) => {
      const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
      .from('settings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
};

export const modifierCurrency = async (id: any, currencyData: Record<string, any>) => {
      const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
      .from('settings')
      .update(currencyData)
      .eq('id', id);

    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
}; 