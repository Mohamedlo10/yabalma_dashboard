"use client";




// import { cookies } from "next/headers";
import { getallcommandes } from "@/app/api/commandes/query";
import { getSupabaseSession } from "@/lib/authMnager";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { CommandeData } from "./components/commande";
import { type Commande } from "./schema";
import { useCommande } from "./use-commande";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function Page() {
  const [config, setConfig] = useCommande();
  const defaultLayout = [ 300,200 ];
  const defaultCollapsed = false;
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {

        const data: any = await getallcommandes()
        console.log(data)

        if (data && data.length > 0) {
          console.log(data)
          setCommandes(data)
        }
       
        const data3= getSupabaseSession()
        if (data3 != null) {
          if(data3.access_groups?.commandes)
            {
              console.log("autoriser...")
            }
            else
            {
              router.push(`/dashboard`);
            }
            
        
      }
      } catch (error) {
        console.error("Error fetching room details:", error)
      } finally {
        setIsLoading(false)
      }
    }
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
    <>
      <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col h-full md:flex">
        <CommandeData
          commandes={commandes}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}
