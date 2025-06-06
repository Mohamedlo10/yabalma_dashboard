"use client";
import { getGpById } from "@/app/api/gp/query";
import { Button } from "@/components/ui/button";
import { getSupabaseSession } from "@/lib/authMnager";
import { Camera } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { CSSProperties, Suspense, useEffect, useRef, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { type User } from "../../schema";
import AnnonceInfo from "./annoncenfo/annonceInfo";
import CommandeInfo from "./commandeInfo/commandeInfo";
import PersonalInfo from "./personalInfo";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const RecupInfo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [userImage, setuserImage] = useState<string>("/avatars/01.png");
  const router = useRouter();
  const searchParams = useSearchParams();

  <Suspense fallback={<div>Chargement...</div>}></Suspense>;
  const userId = searchParams.get("id");
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
        const data: any = await getGpById(userId);
        if (data != null) {
          console.log(data);
          setUser(data);
        }
        const data3 = getSupabaseSession();
        if (data3 != null) {
          if (data3.access_groups?.utilisateurs) {
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
      <div className="p-4">
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
        <div className="flex flex-col w-full max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 py-2">
            {/* Avatar and name */}
            <div className="flex flex-auto items-center min-w-32 gap-12">
              <div className="relative w-16 md:w-28 h-16 md:h-28  rounded-full border-4 bg-slate-100 flex items-center justify-center">
                {!imageLoaded && (
                  <span className="md:text-5xl text-base  font-bold text-red-700">
                    {getInitials(user?.nom || "User", user?.prenom || "User")}
                  </span>
                )}
                <img
                  src={user?.img_url ? user?.img_url : ""}
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
              <div className="flex flex-col sm:max-w-full max-w-44 ml-0 md:ml-4">
                <div className="text-base md:text-2xl font-semibold sm:w-full w-36 tracking-tight leading-7 md:leading-snug truncate">
                  {user?.prenom} {user?.nom}
                </div>
                <div className="flex justify-center flex-col gap-2 items-center">
                  <div className="leading-7 truncate text-sm md:text-xl font-bold text-red-700">
                    GP
                  </div>
                  <div className="flex items-center justify-center">
                    <Button onClick={handleButtonClick}>
                      <Camera />
                      <span className="ml-2">Change Profile</span>
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }} // Masquer l'input file
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-auto border-t overflow-x-auto bg-white -mt-px">
        <div className="w-full text-xs md:text-base mx-auto">
          {/* Tabs - conteneur scrollable */}
          <div className="flex overflow-x-auto py-4 px-2 no-scrollbar">
            <div className="flex flex-nowrap gap-2 md:gap-4 min-w-full">
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
                Annonces
              </Button>
              <Button
                className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${
                  activeTab === 2
                    ? "active bg-red-700 text-white"
                    : " opacity-70 bg-white text-red-800"
                }`}
                onClick={() => setActiveTab(2)}
              >
                Commandes
              </Button>
              <Button
                className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${
                  activeTab === 3
                    ? "active bg-red-700 text-white"
                    : " opacity-70 bg-white text-red-800"
                }`}
                onClick={() => setActiveTab(3)}
              >
                Transactions
              </Button>
              <Button
                className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${
                  activeTab === 4
                    ? "active bg-red-700 text-white"
                    : " opacity-70 bg-white text-red-800"
                }`}
                onClick={() => setActiveTab(4)}
              >
                Commentaires
              </Button>
            </div>
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 0 && (
              <div>
                <PersonalInfo user={user} />
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <AnnonceInfo userId={user?.id_client} />
              </div>
            )}
            {activeTab === 2 && (
              <div>
                <CommandeInfo userId={user?.id_client} />
              </div>
            )}
            {activeTab === 3 && <Transaction />}
            {activeTab === 4 && <Commentaire />}
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
