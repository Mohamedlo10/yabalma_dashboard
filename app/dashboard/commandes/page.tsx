"use client";




// import { cookies } from "next/headers";
import Image from "next/image";
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

export default function CommandePage() {
  const [config, setConfig] = useCommande();
  const defaultLayout = [ 300,200 ];
  const defaultCollapsed = false;


  const [commandes, setCommandes] = useState<Commande[]>([]);
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);

  async function fetchCommandes() {
    console.log("Fetching commandes...");
    try {
      const response = await fetch("/api/commandes");
      const data = await response.json();
  
      // Les commandes sont déjà enrichies avec les GP
      console.log(data);
  
      setConfig(prev => ({ ...prev, commandes: data }));
      setCommandes(data);
    } catch (error) {
      console.error("Failed to fetch commandes:", error);
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    fetchCommandes();
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
