"use client";

import { Button } from "@/components/ui/button";

import { getCommentaires } from "@/app/api/commentaire/query";
import Drawer from '@mui/material/Drawer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
// Composant principal de la page des utilisateurs
export default function Page() {
  const [comments, setcomments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  let [color, setColor] = useState("#ffffff");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const handleNavigation = (idAnnonce:string) => {
    router.push(`/dashboard/annonces/profile?id=${idAnnonce}`);
  };
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getCommentaires()
        if (data && data.length > 0) {
          setcomments(data)
          console.log(data)
          setTotal(data.length);
         
        }
        
      } catch (error) {
        console.error("Error fetching room details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])


  
  
const handleSubmit=async()=>{
  console.log("j envoie")
  }


  const handleCommentClick = (Comment: any) => {
    setSelectedComment(Comment);
    setIsDrawerOpen(true);
  };

  const handleAddClientClick = () => {
    setSelectedComment(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedComment(null);
  };

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
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">Commentaires</h2>
            <p className="text-muted-foreground">Liste des Commentaires</p>
          </div>
          <div className="flex items-center space-x-2">
       
          </div>
        </div>

        {/* Tableau des données */}
        <DataTable 
        data={comments}
        columns={columns}
        onRowClick={handleCommentClick}
        currentPage={currentPage} 
        total={total} 
        setCurrentPage={setCurrentPage} 
      />

      
       
      </div>

      {/* Drawer pour afficher les informations de l'utilisateur ou le formulaire d'ajout */}
      <Drawer anchor='right' open={isDrawerOpen} onClose={closeDrawer}>
        <div className="p-4 w-[32vw]">
          {(
            // Affichage des informations de l'utilisateur
            selectedComment && (
              <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
                <h2 className="mb-8 text-2xl font-bold">
                  Commentaire de {selectedComment.client.prenom} {selectedComment.client.nom}
                </h2>
                 <img
                  src={selectedComment.client.img_url}
                  alt="Comment Profile"
                  width={120}
                  height={120}
                  className="mb-10 h-32 w-32 rounded-full object-cover"
                /> 
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">ID</div>
                  {selectedComment.id}
                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Contenu</div>
                  {selectedComment.content}
                </div>
                 <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Annonce</div>
                  {selectedComment.annonce?.source} - {selectedComment.annonce?.destination} du {new Date(selectedComment.annonce?.date_depart as string).toLocaleDateString()}

                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Date de publication</div>
                  <div>
                    {format(new Date(selectedComment.created_at), 'dd MMMM yyyy', { locale: fr })}
                    {` à ${format(new Date(selectedComment.created_at), 'HH:mm')}`}
                  </div>
                </div>
                {/* <div className="text-base grid grid-cols-2 p-3 items-center rounded-md shadow-sm w-full gap-full">
                          <div className="font-normal text-base">Actif</div>
                          {selectedComment.actif ? (<div className="bg-green-600 p-1 w-12 items-center justify-center flex text-white rounded-sm">Oui</div>) : (<div className="bg-red-600 p-1 w-12 items-center justify-center flex text-white rounded-sm">Non</div>)}
                </div> */}
                <div className="ml-auto pt-12 w-full items-center justify-center flex font-medium">
                  <Button  onClick={() => handleNavigation(selectedComment.id_annonce)} className="w-fit h-10 font-bold">Voir détails de l'annonce</Button>
                </div>
              </div>
            )
          )}
        </div>
      </Drawer>
    </>
  );
}

