import { createClient } from "@/lib/supabaseClient";


const supabase =createClient()

export const getallannonces =async()=>{

  try {
    const { data, error } = await supabase
      .from('annonce')
      .select(`
        *,
        client(*)
      `)
      .order('created_at', { ascending: false });
  
    if (error) throw error;
  
    return data as any || [];
  } catch (err) {
    throw err;
  }

}


export const supprimerAnnonce = async (id_annonce: any) => {
  try {
    const { data, error } = await supabase
      .from('annonce')
      .delete()  
      .eq('id_annonce', id_annonce);  

    if (error) throw error;
    return data;  
  } catch (err) {
    throw err; 
  }
};

export const modifierAnnonce = async (id_annonce: any, annonceData: Record<string, any>) => {
  try {
    const { data, error } = await supabase
      .from('annonce')
      .update(annonceData) 
      .eq('id_annonce', id_annonce);  

    if (error) throw error;
    return data;  
  } catch (err) {
    throw err;  
  }
};

export const getAnnonceById =async(id:any)=>{

  try {
    const { data, error } = await supabase
      .from('annonce')
      .select(`
        *,
        client(*)
      `)
      .eq('id_annonce',id)
      .order('created_at', { ascending: false });
  
    if (error) throw error;
  
    return data[0] as any;
  } catch (err) {
    throw err;
  }

}

export const getAnnoncesClient =async(id:any)=>{

  try {
    const { data, error } = await supabase
      .from('annonce')
      .select(`
        *,
        client(*)
      `).eq('id_client',id)
      .order('created_at', { ascending: false });
  
    if (error) throw error;
  
    return data as any;
  } catch (err) {
    throw err;
  }
  

}


export const getAnnoncesCountByMonth = async () => {
  try {
    const { data, error } = await supabase
    .rpc('get_annonces_count_by_month')

    if (error) throw error;

    return data as any;
  } catch (err) {
    throw err;
  }
}

