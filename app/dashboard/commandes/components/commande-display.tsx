import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { format } from 'date-fns';
import {
  MapPin,
  MoreVertical,
  Phone
} from "lucide-react";


import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { fr } from "date-fns/locale";
import { FaArrowRight } from 'react-icons/fa';
import Flag from "react-world-flags";
import { type Commande } from '../schema';


interface CommandeDisplayProps {
  commande: Commande | null
}

export function CommandeDisplay({ commande }: CommandeDisplayProps) {
  const today = new Date()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center py-2 px-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-row text-base  items-center justify-center gap-3">
          <div className="font-bold  text-muted-foreground">Commande de </div>     
          <div className="font-bold text-red-700 ">{commande?.client?.prenom} {commande?.client?.nom}</div>  
          </div>
               
        </div>
        <div className="ml-auto flex items-center gap-2">

        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!commande}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {commande ? (
        <div className="flex flex-1 flex-col max-h-[84vh] overflow-y-auto items-center ">
        <div className="flex w-full max-w-xl flex-col items-center  bg-white p-4 text-left">

                <div className="flex flex-row gap-2 w-full mb-4">
                    <div className="flex flex-col w-full items-center gap-2 ">
                                <div className="mb-2 text-base font-bold leading-none">
                                  Client
                                </div>
                                    <Avatar className="hidden h-28 w-28  sm:flex">
                                    <AvatarImage src={`${commande.client?.img_url}`} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                    <AvatarFallback>client</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                    <p className="text-base font-bold leading-none text-red-700">
                                    
                                    {commande.client?.prenom} {commande.client?.nom}
                                    </p>
                                    </div>
                            

                                    <div className="line-clamp-2 flex flex-row gap-2 font-bold text-base text-muted-foreground">
                                        
                                    <MapPin /> {commande.client?.Tel}
                                  </div>
                    
                    </div> 
                    <div className="flex flex-col w-full items-center gap-2 ">
                    <div className="mb-2 text-base font-bold leading-none">
                                  GP
                                </div>
                                    <Avatar className="hidden h-28 w-28  sm:flex">
                                    <AvatarImage src={`${commande.annonce?.gp?.img_url}`} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                    <AvatarFallback>client</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                    <p className="text-base font-bold leading-none text-red-700">
                                    
                                    {commande.annonce?.gp?.prenom} {commande.annonce?.gp?.nom}
                                    </p>
                                    </div>
                            

                                    <div className="line-clamp-2 flex flex-row gap-2 font-bold text-base text-muted-foreground">
                                        
                                    <Phone /> {commande.annonce?.gp?.Tel}
                                  </div>
                    
                    </div> 
                </div>
               
                <div className='flex flex-row gap-2 mt-8'>
                  <div className="flex flex-col items-center w-28 font-bold justify-center">
                     {commande.annonce?.paysDepart.pays }
                    <Flag code={commande.annonce?.paysDepart.code} className="h-8 w-10" /> 
                    </div>
                    <div className='flex items-center justify-center pt-4'>
                    <FaArrowRight/>
                    </div>
                    <div className="flex flex-col items-center w-28 font-bold justify-center">
                    {commande.annonce?.paysArrive.pays }
                    
                    <Flag code={commande.annonce?.paysArrive.code} className="h-8 w-10" /> 
                    </div>
                  </div>
                {/* <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">ID</div>
                  <div className="text-sm">
                  {commande.id}
                  </div>
                </div> */}
                <div className="pt-8 px-2 lg:px-2 xl:px-2 w-full grid items-center gap-0 justify-center grid-cols-2">
                  <div className="flex flex-row w-full col-span-2 gap-14 ">
                  <div className="text-base grid grid-cols-2 gap-auto items-center justify-center font-bold w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-base text-muted-foreground">Tarif: </div>
                      <div className="text-base text-red-700 flex items-end w-full justify-end">
                      {commande.annonce?.tarif}/KG
                      </div>
                    </div>
                    <div className="text-base grid grid-cols-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-base text-muted-foreground">Charge: </div>
                      <div className="text-base text-red-700 flex items-end w-full justify-end">
                      {commande.charge}/KG
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row w-full col-span-2 gap-14 ">
                    <div className="text-base grid grid-cols-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-base text-muted-foreground">Montant: </div>
                      <div className=" flex items-end w-full text-red-700 justify-end">
                      {commande.charge*commande.annonce?.tarif} FCFA
                      </div>
                    </div>
                    <div className="text-base grid grid-cols-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-base text-muted-foreground">Status: </div>
                      <div className=" flex items-end w-full justify-end">
                      {commande.status}
                      </div>
                    </div>
                    </div>


                    <div className="text-base grid grid-cols-2 col-span-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-base text-muted-foreground">Commande passée le: </div>
                      <div className="flex items-end w-full justify-end">
                        {format(new Date(commande.created_at), 'dd MMMM yyyy', { locale: fr })}
                        {` à ${format(new Date(commande.created_at), 'HH:mm')}`}
                      </div>
                    </div>
                    <div className="text-base grid grid-cols-2 col-span-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row gap-12 p-1 font-bold text-base text-muted-foreground">Date limite de depot: </div>
                      <div className="flex items-end w-full justify-end">
                        {format(new Date(commande.limitLivraison), 'dd MMMM yyyy', { locale: fr })}
                        {` à ${format(new Date(commande.limitLivraison), 'HH:mm')}`}
                      </div>
                    </div>

                    <div className="flex flex-row w-full col-span-2 gap-8 ">
                    
                    <div className="text-base grid grid-cols-2 gap-auto items-center justify-center font-bold  w-full mt-4">
                      <div className="line-clamp-2 flex flex-row  p-1 font-bold text-base text-muted-foreground">Destinataire: </div>
                      <div className="flex items-end w-full justify-end">
                      {commande.destinataire.prenom} {commande.destinataire.nom}
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-row gap-auto items-center justify-center font-bold text-lg gap-2 w-full mt-4">
                    <div className="text-base text-muted-foreground">
                    <Phone />
                    </div>
                      {commande.destinataire.Tel}
                    </div>
                    </div>

                    <div className=" col-span-2 flex flex-row gap-auto items-center justify-center font-bold text-lg gap-2 w-full mt-8">
                      <MapPin /> {commande.destinataire.localisation} {commande.destinataire.codePostal}
                    </div>

                   
                  
                    
                    </div>
                    <div className="ml-auto pt-10 w-full items-center justify-center gap-4 flex font-medium">
                    <Button type="submit"  className="w-fit h-10 bg-red-600 font-bold">Supprimer</Button>
                      <Button type="submit"  className="w-fit h-10 font-bold">Modifier</Button>
                    </div>
              </div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center p-8 text-center text-xl text-muted-foreground">
          Aucune commande selectionnee
        </div>
      )}
    </div>
  )
}
