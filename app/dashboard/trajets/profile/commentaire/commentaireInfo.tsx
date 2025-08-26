"use client";
import React from 'react';

import { getCommentaireByIdAnnonce } from "@/app/api/commentaire/query";
import { Commande } from "@/app/dashboard/commandes/schema";
import Drawer from '@mui/material/Drawer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

type CommandeInfoProps = {
  annonceId: string | null | undefined;
};

const CommentaireInfo: React.FC<CommandeInfoProps> = ({ annonceId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  let [color, setColor] = useState("#ffffff");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);

  const [commandes, setCommandes] = useState<Commande[]>([]);



  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {

        const data: any = await getCommentaireByIdAnnonce(annonceId)
        console.log(data)

        if (data && data.length > 0) {
          console.log(data)
          setCommandes(data)
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



  const handleUserClick = (user: any) => {
    setSelectedComment(user);
    setIsAddingClient(false);
    setIsDrawerOpen(true);
  };

  const handleAddClientClick = () => {
    setSelectedComment(null);
    setIsAddingClient(true);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedComment(null);
    setIsAddingClient(false);
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
      <div className="hidden max-h-[48vh] overflow-y-auto flex-1 flex-col p-2 md:flex">

        {/* Tableau des données */}
        <DataTable 
        data={commandes}
        columns={columns}
        onRowClick={handleUserClick}
        currentPage={currentPage} 
        total={total} 
        setCurrentPage={setCurrentPage} 
      />

      
       
      </div>

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
                </div>
              </div>
            )
          )}
        </div>
      </Drawer>
    </>
  );


}


export default CommentaireInfo

  

   