import { createClient } from "@/lib/supabaseClient"
import { getSupabaseSession } from "@/lib/authMnager"


const supabase =createClient()

export const getallclient =async()=>{
  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }

 try {
  const { data, error } = await supabase.rpc('get_clients_with_annonces')

  if (error) throw error 
  return data as any
 } catch (err) {
  throw err
 }

}

export const creerClient = async (clientData: Record<string, any>) => {
  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
      .from('client')
      .insert([clientData]);  // Insère l'objet client complet

    if (error) throw error;
    return data; 
  } catch (err) {
    throw err;
  }
};


export const modifierClient = async (id_client: any, clientData: Record<string, any>) => {
  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
      .from('client')
      .update(clientData) 
      .eq('id_client', id_client);  

    if (error) throw error;
    return data;  
  } catch (err) {
    throw err;  
  }
};

export const supprimerClient = async (id_client: any) => {
  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
      .from('client')
      .delete()  // Supprime l'enregistrement
      .eq('id_client', id_client);  // Sélectionne le client à supprimer en fonction de son id

    if (error) throw error;
    return data;  // Retourne les données de l'enregistrement supprimé
  } catch (err) {
    throw err;  // Gère l'erreur
  }
};



export const uploadFile = async (fileName:string,uploadFile:File) => {
  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const {  error } = await supabase.storage
    .from('yabalma/images') // Assurez-vous que ce chemin est correct
    .upload(fileName, uploadFile);
    const { data } = supabase.storage.from('yabalma/images').getPublicUrl(fileName);
    if (error) throw error;
    console.log(data)
    return data;  
  } catch (err) {
    throw err;
  }
};

export const replaceFile = async (fileName: string, uploadFile: File) => {
  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    // Supprimer l'image existante
    const { error: deleteError } = await supabase.storage
      .from('yabalma/images')
      .remove([fileName]); // Suppression de l'image existante

    if (deleteError && deleteError.message !== "File does not exist") {
      throw deleteError;
    }

    // Télécharger la nouvelle image
    const { error: uploadError } = await supabase.storage
      .from('yabalma/images')
      .upload(fileName, uploadFile);

    if (uploadError) {
      throw uploadError;
    }

    // Récupérer l'URL publique du fichier
    const { data } = supabase.storage.from('yabalma/images').getPublicUrl(fileName);

    console.log(data);
    return data;
  } catch (err) {
    throw err;
  }
};





export const getclientPays =async()=>{

  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
  .rpc('client_count_by_country')
  

   if (error) throw error 
   return data as any
  } catch (err) {
   throw err
  }
 
 }

 export const getclientById =async(id:string | null)=>{

  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase.from('client').select('*').eq("id_client",id).eq("is_gp",false)
  

   if (error) throw error 
   return data[0] as any
  } catch (err) {
   throw err
  }
 
 }

 export const getClientCount = async () => {
  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
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


 export const geTopClient = async () => {
  const role = getSupabaseSession();

    if (!role){
      return { error: "Non autorisé - Session invalide", redirect: "/" };
    }
  try {
    const { data, error } = await supabase
    .rpc('get_top_client')

    if (error) throw new Error('Erreur lors de la récupération du GP le plus ancien.');

    if (!data || data.length === 0) {
      throw new Error('Aucun GP trouvé.');
    }
    return data[0];
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
  }
};


