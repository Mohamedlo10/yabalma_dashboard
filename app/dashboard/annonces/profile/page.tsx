"use client";
import { getAnnonceById } from "@/app/api/annonces/query";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';
import { CSSProperties, useEffect, useRef, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Annonce } from "../schema";
import CommandeInfo from "./commandeInfo/commandeInfo";
import CommentaireInfo from "./commentaire/commentaireInfo";
import PersonalInfo from './personalInfo';

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const AnnonceProfile = ({  }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [annonce, setAnnonce] = useState<Annonce>();
  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [annonceImage, setAnnonceImage] = useState<string >('/avatars/01.png');
  const router = useRouter();
  const searchParams = useSearchParams();
  const annonceId = searchParams.get('id');
  const fileInputRef = useRef<HTMLInputElement>(null); 

  const handleRetour = () => {
    // Logique pour retourner
    console.log("Retour");
    router.back();
  };
  const [imageLoaded, setImageLoaded] = useState(false);

  const getInitials = (name:string,name2:string) => {
    const initial1 = name
      ?.split(' ')
      .map((word:string) => word[0])
      .join('');
      const initial2 = name2
      ?.split(' ')
      .map((word:string) => word[0])
      .join('');
      const initials=initial1+initial2;
    return initials?.toUpperCase();
  };

  const handleButtonClick = () => {
    if(fileInputRef.current)
    fileInputRef.current.click(); // Déclenche le clic sur l'input file
  };

  const handleFileChange = (event:any) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Fichier sélectionné :", file);
      // Ajouter ici le code pour uploader l'image
    }
  };
  
  

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getAnnonceById(annonceId)
        if (data != null) {
          console.log(data)
          setAnnonce(data)         
        }
        
      } catch (error) {
        console.error("Error fetching user details:", error)
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
          <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-4">
            {/* Avatar and name */}
            <div className="flex flex-auto items-center min-w-32 gap-12">
            <div className="relative w-28 h-28  rounded-full border-4 bg-slate-100 flex items-center justify-center">
                {!imageLoaded && (
                  <span className="text-8xl font-bold text-red-700">
                    {getInitials(annonce?.client?.nom || 'User',annonce?.client?.prenom || 'User')}
                  </span>
                )}
                <img
                  src={annonce?.client?.img_url ? annonce?.client?.img_url : ''}
                  className={`object-cover rounded-full w-full h-full ${imageLoaded ? '' : 'hidden'}`}
                  alt="Profile Image"
                  width={240}
                  height={240}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(false)}
                />
              </div>
              <div className="flex flex-col sm:max-w-full max-w-44 ml-4">

                <div className="flex justify-center flex-col gap-2 items-center">
                  <div className="leading-7 truncate text-xl font-bold text-red-700">
                  ANNONCE
                  </div>
                  <div className="flex truncate text-4xl font-bold items-center justify-center">
                      {annonce?.source} - {annonce?.destination}
                  </div>

                </div>
                
                
              </div>
            </div>
          </div>
          <div className="text-lg md:text-2xl font-semibold sm:w-full items-center justify-center w-36 tracking-tight leading-7 md:leading-snug truncate">
                {annonce?.client?.prenom} {annonce?.client?.nom}
                </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-auto border-t bg-white -mt-px">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Tabs */}
          <div className="tabs flex flex-row gap-28 p-2 py-8 items-center justify-center">
            <Button
              className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${activeTab === 0 ? "active bg-red-700 text-white" : " opacity-70 bg-white text-red-800"}`}
              onClick={() => setActiveTab(0)}
            >
              Informations 
            </Button>
            <Button
              className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${activeTab === 1 ? "active bg-red-700 text-white" : " opacity-70 bg-white text-red-800"}`}
              onClick={() => setActiveTab(1)}
            >
              Commandes
            </Button>
            <Button
              className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${activeTab === 2 ? "active bg-red-700 text-white" : " opacity-70 bg-white text-red-800"}`}
              onClick={() => setActiveTab(2)}
            >
              Transactions
            </Button>
            <Button
              className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${activeTab === 3 ? "active bg-red-700 text-white" : " opacity-70 bg-white text-red-800"}`}
              onClick={() => setActiveTab(3)}
            >
              Commentaires
            </Button>
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 0 && (
              <div>
                <PersonalInfo annonce={annonce} />
              </div>
            )}
             {activeTab === 1 && (
              <div>
                <CommandeInfo annonceId={annonce?.id_annonce} />
              </div>
            )}
            {activeTab === 2 && <Transaction />}
            {activeTab === 3  && (
              <div>
                <CommentaireInfo annonceId={annonce?.id_annonce} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Components for the tabs (replace with your actual components)  


const Transaction = () => {
  return <div className="text-xl pt-12 text-zinc-600  flex items-center justify-center">Pas de Transactions pour le moment</div>;
};

const Commentaire = () => {
  return <div className="text-xl pt-12 text-zinc-600  flex items-center justify-center">Pas de Commentaires pour le moment</div>;

};

export default AnnonceProfile;
