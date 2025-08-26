import { getSupabaseSession } from "@/lib/authMnager";
import { createClient } from "@/lib/supabaseClient";


const supabase =createClient()

export const getUsersCount = async () => {
    const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { count, error } = await supabase
      .from('client')
      .select('*', { count: 'exact', head: true }); // head:true pour ne pas récupérer de données

    if (error) throw error;

    return count; // Cela renvoie uniquement le nombre
  } catch (err) {
    throw err;
  }
};

