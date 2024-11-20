import { createClient } from "@/lib/supabaseClient";


const supabase =createClient()

export const getallcommandes =async()=>{

  try {
    const { data, error } = await supabase
      .from('commande')
      .select(`
        *,
        annonce(
          *,
          client(*) 
        ),
        client(*) 
      `)
      .order('created_at', { ascending: false });
  
    if (error) throw error;
  
    return data as any;
  } catch (err) {
    throw err;
  }
  
}

export const getCommandesClient =async(id:any)=>{

  try {
    const { data, error } = await supabase
      .from('commande')
      .select(`
        *,
        annonce(
          *,
          client(*) 
        ),
        client(*) 
      `).eq("id_client",id)
      .order('created_at', { ascending: false });
  
    if (error) throw error;
  
    return data as any;
  } catch (err) {
    throw err;
  }
  
}

export const getCommandesByIdAnnonce =async(id:any)=>{

  try {
    const { data, error } = await supabase
      .from('commande')
      .select(`
        *,
        annonce(
          *,
          client(*) 
        ),
        client(*) 
      `).eq("id_annonce",id)
      .order('created_at', { ascending: false });
  
    if (error) throw error;
  
    return data as any;
  } catch (err) {
    throw err;
  }
  
}

export const getCommandesForCurrentMonthCount = async () => {
  try {
    const { count, error } = await supabase
      .from('commande')
      .select('id', { count: 'exact', head: true }) 
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()) // Début du mois en cours
      .lte("created_at", new Date().toISOString()); 

    if (error) throw error;
  
    return count; // Retourne le nombre de commandes
  } catch (err) {
    throw err;
  }
};



export const getcommandesCountByMonth = async () => {
  try {
    const { data, error } = await supabase
    .rpc('get_commandes_count_by_month')

    if (error) throw error;

    return data as any;
  } catch (err) {
    throw err;
  }
}

export const getcommandeAnnonceCount = async () => {
  try {
    const { data, error } = await supabase
    .rpc('get_commandes_and_annonces_by_date')

    if (error) throw error;

    return data as any;
  } catch (err) {
    throw err;
  }
}

