import { createClient } from "@/lib/supabaseClient"


const supabase =createClient()

export const getalllogs =async()=>{

 try {
  const { data, error } = await supabase.from('client').select('*').eq("is_gp",true)

  if (error) throw error 
  return data as any
 } catch (err) {
  throw err
 }

}
