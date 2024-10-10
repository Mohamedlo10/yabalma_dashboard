import { createClient } from "@/lib/supabaseClient";


const supabase =createClient()

export const getUsersCount = async () => {
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

