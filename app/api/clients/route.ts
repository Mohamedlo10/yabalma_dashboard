import { createClient } from "@/lib/supabaseClient"


const supabase =createClient()

export const getallclient =async()=>{

 try {
  const { data, error } = await supabase.from('client').select('*').eq("is_gp",false).order('created_at', { ascending: false }) 

  if (error) throw error 
  return data as any
 } catch (err) {
  throw err
 }

}


export const getclientPays =async()=>{

  try {
    const { data, error } = await supabase
  .rpc('client_count_by_country')
  

   if (error) throw error 
   return data as any
  } catch (err) {
   throw err
  }
 
 }

 export const getclientById =async(id:string)=>{

  try {
    const { data, error } = await supabase.from('client').select('*').eq("id_client",id).eq("is_gp",false)
  

   if (error) throw error 
   return data as any
  } catch (err) {
   throw err
  }
 
 }

 export const getClientCount = async () => {
  try {
    const { count, error } = await supabase
      .from('client')
      .select('*', { count: 'exact', head: true }).eq("is_gp",false); 

    if (error) throw error;

    return count; // Cela renvoie uniquement le nombre
  } catch (err) {
    throw err;
  }
};


 export const getOldestclient = async () => {
  try {
    const { data, error } = await supabase
      .from('client')
      .select('*')
      .eq('is_gp', false)
      .order('created_at', { ascending: false }) //plus recent false
      .limit(1); 
    if (error) throw new Error('Erreur lors de la récupération du client le plus ancien.');

    if (!data || data.length === 0) {
      throw new Error('Aucun client trouvé.');
    }

    return data[0];
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
  }
};
