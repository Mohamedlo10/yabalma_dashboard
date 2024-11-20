"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  MapPin
} from "lucide-react";
import React from 'react';

import { getAnnoncesClient } from "@/app/api/annonces/route";
import { Annonce } from "@/app/dashboard/annonces/schema";
import Drawer from '@mui/material/Drawer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { CSSProperties, useEffect, useState } from "react";
import { FaArrowRight } from 'react-icons/fa';
import BeatLoader from "react-spinners/BeatLoader";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

type AnnonceInfoProps = {
  userId: string | null | undefined;
};

const AnnonceInfo: React.FC<AnnonceInfoProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnonce, setSelectedAnnonce] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  let [color, setColor] = useState("#ffffff");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);

  const [annonces, setannonces] = useState<Annonce[]>([]);



  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {

        const data: any = await getAnnoncesClient(userId)
        console.log(data)

        if (data && data.length > 0) {
          console.log(data)
          setannonces(data)
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

const router = useRouter();


const handleNavigation = (idUser:string) => {
  // Par exemple, naviguer vers la page de profil en passant l'ID de l'utilisateur en paramètre
  // router.push(`/dashboard/utilisateurs/Clients/profile?id=${idUser}`);
};

  const handleUserClick = (user: any) => {
    setSelectedAnnonce(user);
    setIsAddingClient(false);
    setIsDrawerOpen(true);
  };

  const handleAddClientClick = () => {
    setSelectedAnnonce(null);
    setIsAddingClient(true);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAnnonce(null);
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
        data={annonces}
        columns={columns}
        onRowClick={handleUserClick}
        currentPage={currentPage} 
        total={total} 
        setCurrentPage={setCurrentPage} 
      />

      
       
      </div>

      <Drawer anchor='right' open={isDrawerOpen} onClose={closeDrawer}>
      <div className="flex h-full p-4 mt-14 w-[30vw] flex-col">
      {selectedAnnonce ? (
        <div className="flex flex-1 flex-col max-h-[84vh] overflow-y-auto items-center ">
        <div className="flex w-full max-w-xl flex-col items-center  bg-white lg:p-6 xl:p-8 md:p-2 text-left">
                <h2 className="mb-2 text-base font-bold">
                  Auteur
                </h2>
                <div className="flex flex-col w-full items-center gap-6 ">
                                <Avatar className="hidden h-44 w-44  sm:flex">
                                <AvatarImage src={`${selectedAnnonce.client?.img_url}`} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                <AvatarFallback>GP</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-lg font-bold leading-none text-red-700">
                                 
                                {selectedAnnonce.client?.prenom} {selectedAnnonce.client?.nom}
                                </p>
                                </div>
                        

                                <div className="line-clamp-2 flex flex-row gap-2 font-bold text-base text-muted-foreground">
                                    
                                <MapPin /> {selectedAnnonce.lieu_depot}
                              </div>
                 
                </div> 
                <div className='flex flex-row gap-2 mt-2'>
                  <div className="flex flex-col items-center w-28 font-bold justify-center">
                     {selectedAnnonce.source}
                    {/* <Flag code="SN" className="h-8 w-10" />  */}
                    </div>
                    <div className='flex items-center justify-center pt-4'>
                    <FaArrowRight/>
                    </div>
                    <div className="flex flex-col items-center w-28 font-bold justify-center">
                    {selectedAnnonce.destination }
                    
                    {/* <Flag code="FR" className="h-8 w-10" />  */}
                    </div>
                  </div>
                {/* <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">ID</div>
                  <div className="text-sm">
                  {selectedAnnonce.id}
                  </div>
                </div> */}
                <div className="pt-4 px-0 xl:px-2 w-full flex items-center justify-center flex-col">
                    <div className="text-sm grid grid-cols-2 whitespace-nowrap gap-aut items-center justify-start font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Tarif: </div>
                      <div className="text-sm text-red-700 flex items-end w-full justify-end">
                      {selectedAnnonce.poids_max}/KG
                      </div>
                    </div>

                    <div className="text-sm grid grid-cols-2 whitespace-nowrap gap-auto items-center justify-start font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Téléphone: </div>
                      <div className=" flex items-end w-full justify-end">
                      {selectedAnnonce.client?.Tel}
                      </div>
                    </div>
                    <div className="text-sm grid grid-cols-2 whitespace-nowrap gap-auto items-center justify-start font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Publication: </div>
                      <div className="flex items-end w-full justify-end">
                        {format(new Date(selectedAnnonce.created_at), 'dd MMMM yyyy', { locale: fr })}
                        {` à ${format(new Date(selectedAnnonce.created_at), 'HH:mm')}`}
                      </div>
                    </div>
                    <div className="text-sm grid grid-cols-2 whitespace-nowrap gap-auto items-center justify-start font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Statut: </div>
                      <div className=" flex items-end w-full justify-end">
                      {selectedAnnonce.statut}
                      </div>
                    </div>
                    <div className="text-sm grid grid-cols-2 whitespace-nowrap gap-auto items-center justify-start font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Depart: </div>
                      <div className="flex items-end w-full justify-end">
                        {format(new Date(selectedAnnonce.date_depart), 'dd MMMM yyyy', { locale: fr })}
                        {` à ${format(new Date(selectedAnnonce.date_depart), 'HH:mm')}`}
                      </div>
                    </div>
                    <div className="text-sm grid grid-cols-2 whitespace-nowrap gap-auto items-center justify-start font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Arrivee: </div>
                      <div className="flex items-end w-full justify-end">
                        {format(new Date(selectedAnnonce.date_arrive), 'dd MMMM yyyy', { locale: fr })}
                        {` à ${format(new Date(selectedAnnonce.date_arrive), 'HH:mm')}`}
                      </div>
                    </div>
                    
                    </div>
                    <div className="ml-auto pt-10 w-full items-center justify-center gap-4 flex font-medium">
                    <div className="ml-auto pt-14 w-full items-center justify-center flex font-medium">
                                        <Button onClick={() => handleNavigation(selectedAnnonce.id_annonce)} className="w-fit h-10 font-bold">Voir Détails</Button>   
                         </div>
                    </div>
              </div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center p-8 text-center text-xl text-muted-foreground">
          Aucune selectedAnnonce selectionnee
        </div>
      )}
    </div>
      </Drawer>
  </>
  );


}


export default AnnonceInfo

  

   