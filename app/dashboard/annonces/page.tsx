/* "use client";




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
 */

"use client";

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
const PAGE_SIZE = 6; // Nombre d'annonces à charger par page

export default function AnnoncePage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [config, setConfig] = useAnnonce();
  const defaultLayout = [ 300,200 ];
  let [color, setColor] = useState("#ffffff");
  const defaultCollapsed = false;
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); // Page actuelle
  const [hasMore, setHasMore] = useState(true); // Pour vérifier s'il y a encore des annonces à charger

  // Fonction pour récupérer les annonces à partir de l'API
  async function fetchAnnonces(page: number) {
    console.log("Fetching annonces...");
    try {
      setIsLoading(true);
      const response = await fetch(`/api/annonces?page=${page}&limit=${PAGE_SIZE}`);
      const data = await response.json();
      console.log(data)

      if (data.length < PAGE_SIZE) {
        setHasMore(false); // Si moins de 6 annonces sont récupérées, il n'y en a plus à charger
      }

      // Ajouter les nouvelles annonces à celles déjà chargées
      setAnnonces((prevAnnonces) => [...prevAnnonces, ...data]);
    } catch (error) {
      console.error("Failed to fetch Annonces:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Charger les annonces initiales
  useEffect(() => {
    fetchAnnonces(page);
  }, [page]);

  // Fonction pour charger plus d'annonces lors du défilement
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight ||
      isLoading ||
      !hasMore
    ) {
      return;
    }

    // Charger la page suivante
    setPage((prevPage) => prevPage + 1);
  };

  // Ajouter l'écouteur de défilement
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore]);

  if (isLoading && annonces.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <BeatLoader
            color={color}
            loading={isLoading}
            cssOverride={override}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
      </div>
    );
  }

  return (
    <div className="annonces-container">
      <AnnonceData annonces={annonces}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4} />
      {isLoading && (
        <div className="loader">
          <BeatLoader color="#ffffff" loading={isLoading} size={15} />
        </div>
      )}
    </div>
  );
}
