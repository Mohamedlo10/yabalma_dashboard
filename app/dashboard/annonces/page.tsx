"use client";




// import { cookies } from "next/headers";
import { getallannonces } from "@/app/api/annonces/route";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { AnnonceData } from "./components/annonce";
import { type Annonce } from "./schema";
import { useAnnonce } from "./use-annonce";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function AnnoncePage() {
  const [config, setConfig] = useAnnonce();
  const defaultLayout = [ 300,200 ];
  const defaultCollapsed = false;
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      async function fetchData() {
        setIsLoading(true)
        try {
          const data: any = await getallannonces()
          if (data && data.length > 0) {
            console.log(data)
            setAnnonces(data)
            // setTotal(data.length); 
           
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
      <div className="hidden flex-col h-full md:flex">
        <AnnonceData
          annonces={annonces}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}
 

