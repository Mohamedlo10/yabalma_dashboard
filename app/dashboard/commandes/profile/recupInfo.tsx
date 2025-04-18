"use client";
import { getcommandesById } from "@/app/api/commandes/query";
import { Button } from "@/components/ui/button";
import { getSupabaseSession } from "@/lib/authMnager";
import { useRouter, useSearchParams } from "next/navigation";
import { CSSProperties, useEffect, useRef, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Commande } from "../schema";
import ColisInfo from "./colisInfo/colisInfo";
import PersonalInfo from "./personalInfo";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const RecupInfo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [commande, setcommande] = useState<Commande>();
  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [commandeImage, setcommandeImage] = useState<string>("/avatars/01.png");
  const router = useRouter();
  const searchParams = useSearchParams();
  const commandeId = searchParams.get("id");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRetour = () => {
    // Logique pour retourner
    console.log("Retour");
    router.back();
  };
  const [imageLoaded, setImageLoaded] = useState(false);

  const getInitials = (name: string, name2: string) => {
    const initial1 = name
      ?.split(" ")
      .map((word: string) => word[0])
      .join("");
    const initial2 = name2
      ?.split(" ")
      .map((word: string) => word[0])
      .join("");
    const initials = initial1 + initial2;
    return initials?.toUpperCase();
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click(); // Déclenche le clic sur l'input file
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Fichier sélectionné :", file);
      // Ajouter ici le code pour uploader l'image
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (commandeId) {
          const data: any = await getcommandesById(parseInt(commandeId));
          if (data != null) {
            console.log(data);
            setcommande(data);
          }
        }

        const data3 = getSupabaseSession();
        if (data3 != null) {
          if (data3.access_groups?.commandes) {
            console.log("autoriser...");
          } else {
            router.push(`/dashboard`);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
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
    <div className="flex flex-col flex-auto min-w-0">
      {/* Header */}
      <div className="p-1 md:p-4">
        <button className="rounded-xl" onClick={handleRetour}>
          {/* Remplacer mat-icon par une icône équivalente */}
          <svg
            className="m-1 h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full items-start md:gap-16 justify-start flex-row">
        <div className="flex flex-col md:ml-0 ml-6 w-full items-center justify-center  min-w-0 md:my-4">
          {/* Avatar and name */}
          <div className=" flex items-center justify-center text-xs md:text-2xl font-semibold sm:w-full  w-36 tracking-tight leading-7 md:leading-snug truncate">
            Client : {commande?.client?.prenom} {commande?.client?.nom}
          </div>
          <div className="relative w-16 md:w-24 h-16 md:h-24  rounded-full border-4 bg-slate-100 flex items-center justify-center">
            {!imageLoaded && (
              <span className="text-3xl font-bold text-red-700">
                {getInitials(
                  commande?.client?.nom || "User",
                  commande?.client?.prenom || "User"
                )}
              </span>
            )}
            <img
              src={commande?.client?.img_url ? commande?.client?.img_url : ""}
              className={`object-cover rounded-full w-full h-full ${
                imageLoaded ? "" : "hidden"
              }`}
              alt="Profile Image"
              width={240}
              height={240}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
            />
          </div>
        </div>

        <div className="flex w-full md:items-start  pl-6 items-center md:justify-start justify-center flex-col ">
          <div className="flex md:justify-end justify-center flex-col gap-0 md:gap-2 items-center md:items-center">
            <div className="leading-7 truncate text-xs md:text-xl font-bold text-red-700">
              commande
            </div>
            <div className="flex truncate text-center   w-full items-center justify-center text-xs md:text-2xl xl:text-4xl font-bold md:items-center md:justify-center">
              {commande?.annonce?.source} - {commande?.annonce?.destination}
            </div>
          </div>
        </div>

        <div className="flex flex-col  sm:px-8">
          <div className="flex flex-col  flex-auto items-center min-w-0 md:my-4">
            <div className=" flex items-center justify-center text-xs md:text-2xl font-semibold sm:w-full  w-36 tracking-tight leading-7 md:leading-snug truncate">
              GP : {commande?.annonce.client?.prenom}{" "}
              {commande?.annonce.client?.nom}
            </div>
            <div className="relative w-16 md:w-24 h-16 md:h-24  rounded-full border-4 bg-slate-100 flex items-center justify-center">
              {!imageLoaded && (
                <span className="text-3xl font-bold text-red-700">
                  {getInitials(
                    commande?.annonce.client?.nom || "User",
                    commande?.annonce.client?.prenom || "User"
                  )}
                </span>
              )}
              <img
                src={
                  commande?.annonce.client?.img_url
                    ? commande?.annonce.client?.img_url
                    : ""
                }
                className={`object-cover rounded-full w-full h-full ${
                  imageLoaded ? "" : "hidden"
                }`}
                alt="Profile Image"
                width={240}
                height={240}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-auto  md:border-t bg-white -mt-px">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Tabs */}
          <div className="tabs flex flex-row gap-4 overflow-x-auto w-full md:gap-24 p-2 py-5 md:pl-0 pl-56 items-center justify-center">
            <Button
              className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${
                activeTab === 0
                  ? "active bg-red-700 text-white"
                  : " opacity-70 bg-white text-red-800"
              }`}
              onClick={() => setActiveTab(0)}
            >
              Informations
            </Button>
            <Button
              className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${
                activeTab === 1
                  ? "active bg-red-700 text-white"
                  : " opacity-70 bg-white text-red-800"
              }`}
              onClick={() => setActiveTab(1)}
            >
              Colis
            </Button>
            <Button
              className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${
                activeTab === 2
                  ? "active bg-red-700 text-white"
                  : " opacity-70 bg-white text-red-800"
              }`}
              onClick={() => setActiveTab(2)}
            >
              Transactions
            </Button>
            <Button
              className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${
                activeTab === 3
                  ? "active bg-red-700 text-white"
                  : " opacity-70 bg-white text-red-800"
              }`}
              onClick={() => setActiveTab(3)}
            >
              Commentaires
            </Button>
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 0 && (
              <div>
                <PersonalInfo commande={commande} />
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <ColisInfo detailCommande={commande?.detail_commande} />
              </div>
            )}
            {/*
            {activeTab === 2 && <Transaction />}
            {activeTab === 3  && (
              <div>
                <CommentaireInfo commandeId={commande?.id_commande} />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

// Components for the tabs (replace with your actual components)

const Transaction = () => {
  return (
    <div className="text-xl pt-12 text-zinc-600  flex items-center justify-center">
      Pas de Transactions pour le moment
    </div>
  );
};

const Commentaire = () => {
  return (
    <div className="text-xl pt-12 text-zinc-600  flex items-center justify-center">
      Pas de Commentaires pour le moment
    </div>
  );
};

export default RecupInfo;
