"use client"


import { BarChartComponent } from "@/components/ui/home/bar-chart"
import Commande from "@/components/ui/home/commande"
import Commentaire from "@/components/ui/home/commentaire"
import CirculaireComponent from "@/components/ui/home/utilisateurs-chart"
import ClientPays from "@/components/ui/utilisateurs/clientPays"
import GpPays from "@/components/ui/utilisateurs/gpPays"
import { getSupabaseSession, getSupabaseUser } from "@/lib/authMnager"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { CSSProperties, useEffect, useState } from "react"
import BeatLoader from "react-spinners/BeatLoader"
import { User } from "./accounts/schema"
import { Role } from "./settings/schema"

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red", 
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [role, setRole] = useState<Role>();
  const [user, setUser] = useState<User>();

  const router = useRouter();
  async function fetchData() {
    setIsLoading(true)
   try{
      setRole(getSupabaseSession())
      const data = getSupabaseUser()
      setUser(data) 
    } catch (error) {
      console.error("Error fetching user details:", error)
    } finally {
      setIsLoading(false)
    }

  }
  
  useEffect(() => {
  fetchData()
  }, [])
  

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="sweet-loading">
          <BeatLoader
            color={color}
            loading={isLoading}
            cssOverride={override}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="chart-wrapper max-h-[90vh]  overflow-y-auto mx-auto flex max-w-8xl flex-col flex-wrap items-start justify-center gap-2 p-6 sm:flex-row sm:p-8">
      <div className="grid w-full mx-auto gap-2 sm:grid-cols-1 lg:grid-cols-1 ">
        <div className="w-full grid grid-cols-2 gap-2">
          <div className=" grid grid-cols-1 gap-2">

          {role?.access_groups.finance?(<BarChartComponent/>):(<div className=" flex flex-col pb-12 justify-center items-center ">
            <Image
            src="/yabalma.jpg"
            alt="Image"
            width={485} 
            height={485}
            className=" object-cover "
          />
          <div className="h-8 text-4xl font-serif flex justify-center items-center font-extrabold text-red-800 mr-3 ">
            Bienvenue {user?.user_metadata?.prenom} {user?.user_metadata?.nom}
          </div>
          </div>)}
          {role?.access_groups.utilisateurs?(
             <div className=" grid grid-cols-2 gap-2">
             <ClientPays />
 
             <GpPays/>
           </div>
          ):(<div></div>)}

          </div>
          <div className=" grid grid-cols-1 gap-2">
            {role?.access_groups.utilisateurs || role?.access_groups.commentaires || !role?.access_groups.finance ?(<div className=" grid grid-cols-2 gap-2 ">
                <div className="">
          {role?.access_groups.utilisateurs?(<CirculaireComponent/>):(<div></div>)}

                </div>
                <div className="">
              
          {role?.access_groups.commentaires?(<Commentaire/>):(<div></div>)}

                </div>

                
            </div>):(<div className=" flex flex-col justify-center items-center ">
            <Image
            src="/yabalma.jpg"
            alt="Image"
            width={470} 
            height={470}
            className=" object-cover "
          />
          <div className="h-14 text-4xl font-serif flex justify-center items-center font-extrabold text-red-800 mr-3 ">
            Bienvenue {user?.user_metadata?.prenom} {user?.user_metadata?.nom}
          </div>
          </div>)}
          {role?.access_groups.annonces || role?.access_groups.commandes ?(<Commande/>):(<div></div>)}

          </div>
        </div>
      </div>
          
    </div>
  )
}
