import { createClient } from "@/lib/supabaseClient"


const supabase =createClient()

export const getallgp =async()=>{

 try {
  const { data, error } = await supabase.from('client').select('*').eq("is_gp",true).order('created_at', { ascending: false }) 

  if (error) throw error 
  return data as any
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

 export const getGpById =async(id:string)=>{

  try {
    const { data, error } = await supabase.from('client').select('*').eq("id_client",id).eq("id_gp",true)
  

   if (error) throw error 
   return data as any
  } catch (err) {
   throw err
  }
 
 }


 export const getOldestGp = async () => {
  try {
    const { data, error } = await supabase
      .from('client')
      .select('*')
      .eq('is_gp', true)
      .order('created_at', { ascending: false }) //false pour plus recent et true pour plus ancien
      .limit(1); 
    if (error) throw new Error('Erreur lors de la récupération du GP le plus ancien.');

    if (!data || data.length === 0) {
      throw new Error('Aucun GP trouvé.');
    }

    return data[0];
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
  }
};
