import { createClient } from "@/lib/supabaseClient";


const supabase =createClient()

export const getallgp =async()=>{

 try {
  const { data, error } = await supabase
      .rpc('get_clients_with_stats')

    return data as any;
 } catch (err) {
  throw err
 }

}

export const getGpCount = async () => {
  try {
    const { count, error } = await supabase
      .from('client')
      .select('*', { count: 'exact', head: true }).eq("is_gp",true); 

    if (error) throw error;

    return count; // Cela renvoie uniquement le nombre
  } catch (err) {
    throw err;
  }
};


export const getGpPays =async()=>{

  try {
    const { data, error } = await supabase
  .rpc('gp_count_by_country')
  

   if (error) throw error 
   return data as any
  } catch (err) {
   throw err
  }
 
 }

 export const getGpById =async(id:any)=>{

  try {
    const { data, error } = await supabase.from('client').select('*').eq("id_client",id).eq("is_gp",true)
  

   if (error) throw error 
   return data[0] as any
  } catch (err) {
   throw err
  }
 
 }


 export const getTopGp = async () => {
  try {
    const { data, error } = await supabase
    .rpc('get_top_gp')

    if (error) throw new Error('Erreur lors de la récupération du GP le plus ancien.');

    if (!data || data.length === 0) {
      throw new Error('Aucun GP trouvé.');
    }
    return data[0];
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
  }
};
