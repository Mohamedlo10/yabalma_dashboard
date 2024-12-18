import { createClient } from "@/lib/supabaseClient";


const supabase =createClient()

export const creerRole = async (roleData: Record<string, any>) => {
  try {
    const { data, error } = await supabase
      .from('role')
      .insert([roleData]);  // Insère l'objet role complet

    if (error) throw error;
    return data; 
  } catch (err) {
    throw err;
  }
};


export const getAllRole =async()=>{

  try {
   const { data, error } = await supabase.from('role').select('*').order('created_at', { ascending: false }) 
 
   if (error) throw error 
   return data as any
  } catch (err) {
   throw err
  }
 
 }



 export const supprimerRole = async (id: any) => {
  try {
    const { data, error } = await supabase
      .from('role')
      .delete()  
      .eq('id', id); 

    if (error) throw error;
    return data; 
  } catch (err) {
    throw err;  
  }
};


export const modifierRole = async (id: any, roleData: Record<string, any>) => {
  try {
    const { data, error } = await supabase
      .from('role')
      .update(roleData) 
      .eq('id', id);  

    if (error) throw error;
    return data;  
  } catch (err) {
    throw err;  
  }
};