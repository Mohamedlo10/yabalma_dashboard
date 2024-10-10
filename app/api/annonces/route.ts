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
  
    return data as any;
  } catch (err) {
    throw err;
  }
  

}