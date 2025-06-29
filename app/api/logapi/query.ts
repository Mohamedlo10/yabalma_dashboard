import { createClient } from "@/lib/supabaseClient"


const supabase =createClient()

export const getalllogs =async()=>{

 try {
  const  data =[
    {logid:1,message:"ereur lors de l'authentification de l'utilisateur",userphone:"+221762430964",type:'error',time:'18-01-2024 8:00'},
    {logid:2,message:"les password saisit ne correspondent pas ",userphone:"+221762430964",type:'error',time:'18-01-2024 7h59'},
    {logid:3,message:"Twillio error: ce pays n'est pas pris en compte ",userphone:"+00336745693",type:'error',time:'17-01-2024 14h12'},
    {logid:4,message:"Annonce crée avec succes ",userphone:"+221778074123",type:'info',time:'15-01-2024 8h25'},

   ]
  return data as any
 } catch (err) {
  throw err
 }

}
