"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Phone
} from "lucide-react";
import React from 'react';

import { getCommandesByIdAnnonce } from "@/app/api/commandes/query";
import { Commande } from "@/app/dashboard/commandes/schema";
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

type CommandeInfoProps = {
  annonceId: string | null | undefined;
};

const CommandeInfo: React.FC<CommandeInfoProps> = ({ annonceId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCommande, setSelectedCommande] = useState<any | null>(null);
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

        const data: any = await getCommandesByIdAnnonce(annonceId)
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

const router = useRouter();


const handleNavigation = (idCommande:number) => {
  router.push(`/dashboard/commandes/profile?id=${idCommande}`);
};

  const handleUserClick = (user: any) => {
    setSelectedCommande(user);
    setIsAddingClient(false);
    setIsDrawerOpen(true);
  };

  const handleAddClientClick = () => {
    setSelectedCommande(null);
    setIsAddingClient(true);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCommande(null);
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
        <div className="p-4 mt-24 flex w-[30vw]">
            { selectedCommande && (
             <div className="flex flex-1 flex-col max-h-[84vh] overflow-y-auto items-center ">
             <div className="flex w-full max-w-xl flex-col items-center  bg-white p-4 text-left">
     
                     <div className="flex flex-row gap-2 w-full mb-4">
                         <div className="flex flex-col w-full items-center gap-2 ">
                                     <div className="mb-2 text-base font-bold leading-none">
                                       Client
                                     </div>
                                         <Avatar className="hidden h-24 w-24  sm:flex">
                                         <AvatarImage src={`${selectedCommande.client?.img_url}`} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                         <AvatarFallback className='text-xl  flex items-center justify-center'> N/A</AvatarFallback>
                                         </Avatar>
                                         <div className="grid gap-1">
                                         <p className="text-base font-bold leading-none text-red-700">
                                         
                                         {selectedCommande.client?.prenom} {selectedCommande.client?.nom}
                                         </p>
                                         </div>
                                 
     
                                         <div className="line-clamp-2 flex flex-row gap-2 font-bold text-sm text-muted-foreground">
                                             
                                         <Phone /> {selectedCommande.client?.Tel}
                                       </div>
                         
                         </div> 
                         <div className="flex flex-col w-full items-center gap-2 ">
                         <div className="mb-2 text-base font-bold leading-none">
                                       GP
                                     </div>
                                         <Avatar className="hidden h-24 w-24  sm:flex">
                                         <AvatarImage src={`${selectedCommande.annonce?.client?.img_url}`} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                         <AvatarFallback className='text-xl  flex items-center justify-center'>{selectedCommande.detail_selectedCommande?.type || 'N/A'}</AvatarFallback>
                                         </Avatar>
                                         <div className="grid gap-1">
                                         <p className="text-base font-bold leading-none text-red-700">
                                         
                                         {selectedCommande.annonce?.client?.prenom} {selectedCommande.annonce?.client?.nom}
                                         </p>
                                         </div>
                                 
     
                                         <div className="line-clamp-2 flex flex-row gap-2 font-bold text-sm text-muted-foreground">
                                             
                                         <Phone /> {selectedCommande.annonce?.client?.Tel}
                                       </div>
                         
                         </div> 
                     </div>
                    
                     <div className='flex flex-row gap-2 mt-8'>
                       <div className="flex flex-col items-center w-28 font-bold justify-center">
                          {selectedCommande.annonce?.source }
                         {/* <Flag code={selectedCommande.annonce?.source.code} className="h-8 w-10" />  */}
                         </div>
                         <div className='flex items-center justify-center pt-4'>
                         <FaArrowRight/>
                         </div>
                         <div className="flex flex-col items-center w-28 font-bold justify-center">
                         {selectedCommande.annonce?.destination }
                         
                         {/* <Flag code={selectedCommande.annonce?.destination.code} className="h-8 w-10" />  */}
                         </div>
                       </div>
                     {/* <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                       <div className="font-normal text-base">ID</div>
                       <div className="text-sm">
                       {selectedCommande.id}
                       </div>
                     </div> */}
                     <div className="pt-8 px-2 lg:px-2 xl:px-2 w-full grid items-center gap-0 justify-center grid-cols-1">
                       <div className="grid grid-cols-2 w-full col-span-2 gap-14 ">
                       <div className="text-sm grid grid-cols-2 gap-auto items-center justify-center font-bold w-full mt-4">
                           <div className="line-clamp-2 flex flex-row  p-1 font-bold text-sm text-muted-foreground">Poids max: </div>
                           <div className="text-sm text-black flex items-end w-full justify-end">
                           {selectedCommande.annonce?.poids_max}
                           </div>
                         </div>
                         <div className="text-sm grid grid-cols-2 gap-auto items-center justify-center font-bold w-full mt-4">
                           <div className="line-clamp-2 flex flex-row gap-6 p-1 font-bold text-sm text-muted-foreground">Type: </div>
                           <div className="text-sm text-black flex items-end w-full justify-end">
                           {selectedCommande.detail_selectedCommande?.type}
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex flex-row w-full col-span-2 gap-14 ">
                       <div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                           <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Avec le GP:</div>
                           <div className="flex items-end w-full justify-end">
                           {selectedCommande.is_received_by_gp ?
                                 `OUI`
                               :'NON' }
                           </div>
                         </div>
                         <div className="text-sm grid grid-cols-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                           <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Transport: </div>
                           <div className=" flex items-end w-full justify-end">
                           {selectedCommande.annonce?.type_transport} 
     
                           </div>
                         </div>
                         </div>
     
     
                         <div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                           <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">selectedCommande passée le: </div>
                           <div className="flex items-end w-full justify-end">
                             {format(new Date(selectedCommande.created_at), 'dd MMMM yyyy', { locale: fr })}
                             {` à ${format(new Date(selectedCommande.created_at), 'HH:mm')}`}
                           </div>
                         </div>
                         <div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                           <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Date de depart le: </div>
                           <div className="flex items-end w-full justify-end">
                             {format(new Date(selectedCommande.annonce.date_depart), 'dd MMMM yyyy', { locale: fr })}
                           </div>
                         </div>
                         <div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                           <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Date d'arriver le: </div>
                           <div className="flex items-end w-full justify-end">
                             {format(new Date(selectedCommande.annonce.date_arrive), 'dd MMMM yyyy', { locale: fr })}
                           </div>
                         </div>
                         <div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                           <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Etat du colis:</div>
                           <div className="flex items-end w-full justify-end">
                           {selectedCommande.annonce?.statut}
     
                           </div>
                         </div>
                         <div className="text-sm grid grid-cols-3 col-span-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                           <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-sm text-muted-foreground">Etat de paiement:</div>
                           <div className={`leading-6 text-sm  sm:text-base px-2 w-fit  flex items-end  justify-end  py-1 rounded-md text-white ${selectedCommande?.payment_status === 'unpaid' ? 'bg-red-500' : 'bg-green-500'}`}>
                           {selectedCommande?.payment_status=='unpaid'?'Non regler':'Regler' }
     
                           </div>
                         </div>
     
                         <div className="flex flex-col w-full col-span-2 gap-4 ">
                         
                         <div className="text-sm grid grid-cols-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                         {selectedCommande.detail_commande?.first_name?(<>  <div className="line-clamp-2 flex flex-row  p-1 font-bold text-sm text-muted-foreground">Destinataire: </div>
                           <div className="flex items-end w-full justify-end">
                           {selectedCommande.detail_commande?.first_name} 
                           </div> </>):( <div></div> )}
                           {selectedCommande.detail_commande?.destinataire_number ? (<>  <div className="line-clamp-2 flex flex-row  mt-4 p-1 font-bold text-sm text-muted-foreground">Telephone Destinataire: </div>
                           <div className="flex mt-4 items-end w-full justify-end">
                           {selectedCommande.detail_commande?.destinataire_number} 
                           </div> </>):( <div></div> )}
                         </div>
                        
     
                         </div>
                        {/*  {commande.detail_commande?.location && (
                         <div className=" col-span-2 flex flex-row gap-auto items-center justify-center font-bold text-lg gap-2 w-full mt-8">
                           <MapPin /> {commande.detail_commande?.location} {commande.detail_commande?.code_postal}
                         </div>
                         )} */}
     
                        
                       
                         
                         </div>
                         <div className="ml-auto pt-12 w-full items-center justify-center flex font-medium">
                         <Button onClick={() => handleNavigation(selectedCommande.id)} className="w-fit h-10 font-bold">Voir Détails</Button>   </div>
                   </div>
             </div>
            )}
        </div>
      </Drawer>
  </>
  );


}


export default CommandeInfo

  

   