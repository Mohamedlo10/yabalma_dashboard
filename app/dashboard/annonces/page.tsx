"use client";




// import { cookies } from "next/headers";
import Image from "next/image";
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

  async function fetchAnnonces() {
    console.log("Fetching annonces...");
    try {
      const response = await fetch("/api/annonces");
      const data = await response.json();
  
      // Les annonces sont déjà enrichies avec les GP
      console.log(data);
  
      setConfig(prev => ({ ...prev, annonces: data }));
      setAnnonces(data);
    } catch (error) {
      console.error("Failed to fetch Annonces:", error);
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    fetchAnnonces();
  }, []);
  
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
