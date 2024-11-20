import { createClient } from "@/lib/supabaseClient";


const supabase =createClient()
  
  export const getCommentaires = async () => {
    try {
      const { data, error } = await supabase
      .rpc('get_commentaires_with_annonce_and_client')
  
      if (error) throw error;
  
      return data as any;
    } catch (err) {
      throw err;
    }
  }

export const get5lastCommentaires = async()=>{
    try {
        const { data ,error}= await supabase
        .rpc('get_last_commentaires')

        if (error) throw error;
        return data as any;
    } catch (err) {
        throw err;
    }
}



export const getCommentairesLength = async () => {
  try {
    const { count, error } = await supabase
      .from('commentaire')
      .select('*', { count: 'exact', head: true }); 

    if (error) throw error;
    return count; 
  } catch (err) {
    throw err;
  }
};


export const getCommentaireByIdAnnonce =async(id:any)=>{

  try {
    const { data, error } = await supabase
      .rpc('get_commentaire_by_id_annonce', { p_id_annonce: id });
  
    if (error) throw error;
  
    return data as any;
  } catch (err) {
    throw err;
  }
  
}