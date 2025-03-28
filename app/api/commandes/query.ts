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
      .order('validation_status', { ascending: true }) 
      .order('created_at', { ascending: false });
  
    if (error) throw error;
  
    return data as any || [];
  } catch (err) {
    throw err;
  }
  
}

export const getcommandesById =async(id:number)=>{

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
      .eq("id",id);
  
    if (error) throw error;
  
    return data[0] as any;
  } catch (err) {
    throw err;
  }
  
}


export const modifierCommande = async (id_commande: any, commandeData: Record<string, any>) => {
  try {
    const { data, error } = await supabase
      .from('commande')
      .update(commandeData) 
      .eq('id', id_commande);  

    if (error) throw error;
    return data;  
  } catch (err) {
    throw err;  
  }
};

export const supprimerCommande = async (id_commande: any) => {
  try {
    const { data, error } = await supabase
      .from('commande')
      .delete()  
      .eq('id', id_commande);  

    if (error) throw error;
    return data; 
  } catch (err) {
    throw err;  
  }
};


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
export const getCommandesGp =async(id:any)=>{

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
      `).eq("id_gp",id)
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

