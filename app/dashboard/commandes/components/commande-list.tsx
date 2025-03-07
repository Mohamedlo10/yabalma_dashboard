import { format, formatDistanceToNow } from 'date-fns';

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { fr } from 'date-fns/locale';
import { FaArrowDown, FaArrowRight } from 'react-icons/fa';
import { Commande } from '../schema';
import { useCommande } from "../use-commande";


interface commandeListProps {
  items: Commande[]
}

export function CommandeList({ items }: commandeListProps) {
  const [commande, setCommande] = useCommande()

  if(items.length===0)
  {
    return(
    <div className='text-xl items-center justify-center text-secondary-foreground flex w-full h-full mt-12'>Aucun resultat</div>

    )
  }

  return (
    <ScrollArea className="h-screen ">
      <div className="flex flex-col pb-80 gap-2 p-4 pt-0 ">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-row items-start gap-1 w-full rounded-lg border p-3 text-left text-sm transition-all  hover:bg-accent ",
              commande.selected === item.id && "bg-red-600 hover:bg-red-600 "
            )}
            onClick={() =>
              setCommande({
                ...commande,
                selected: item.id,
             })}>

            <div className="grid grid-cols-4 gap-3 w-full items-center ">
                <div className="flex flex-col xl:w-36 w-32 items-center gap-1 ">
                <p className={cn("text-base font-bold leading-none text-red-700",
                                  commande.selected === item.id && "text-white "
                                  )}>
                                Client
                                </p>
                                <Avatar className="hidden h-14 w-14  sm:flex">
                                <AvatarImage src={`${item.client?.img_url}`} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                <AvatarFallback className='text-xl  flex items-center ml-2 justify-center'>N/A</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className={cn("text-base font-bold leading-none text-red-700",
                                  commande.selected === item.id && "text-white "
                                  )}>
                                {item.client?.prenom} {item.client?.nom}
                                </p>
                                </div>
                        

                                <div className={cn("line-clamp-2 font-bold text-xs text-muted-foreground",
                                    commande.selected === item.id && "text-white "
                                  )}>
                               
                                {item.client?.Tel}
                               
                              </div>
                 
                </div> 

                
                <div className="flex flex-col w-28 items-center gap-1 ">
                <p className={cn("text-base font-bold leading-none text-red-700",
                                  commande.selected === item.id && "text-white "
                                  )}>
                                GP
                                </p>
                                <Avatar className="hidden h-14 w-14  sm:flex">
                                <AvatarImage src={`${item.annonce?.client?.img_url}`} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                <AvatarFallback>client</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className={cn("text-base font-bold leading-none text-red-700",
                                  commande.selected === item.id && "text-white "
                                  )}>
                                {item.annonce?.client?.prenom} {item.annonce?.client?.nom}
                                </p>
                                </div>
                        

                                <div className={cn("line-clamp-2 font-bold text-xs text-muted-foreground",
                                    commande.selected === item.id && "text-white "
                                  )}>
                               
                                {item.annonce?.client?.Tel}
                               
                              </div>
                 
                </div> 
                <div className={cn("flex flex-col items-center text-muted-foreground w-16 font-bold text-sm justify-center",
                          commande.selected === item.id && "text-white "
                        )}>
                   
                  {item.detail_commande?.type}
                  <p className='inline-block'>
                  {format(new Date(item.annonce.date_depart), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                  <p className='w-full flex items-center justify-center'>
                  <FaArrowDown/>
                  </p>
                  <p className='inline-block'>
                  {format(new Date(item.annonce.date_arrive), 'dd/MM/yyyy', { locale: fr })}

                  </p>
                    
                    </div>



                    <div
                  className={cn(
                    "  flex flex-col gap-4",
                    commande.selected === item.id
                      ? "text-foreground"
                      : "text-muted-foreground")}>
                  <div className='text-xs flex flex-row gap-2 bg-white p-2  rounded-sm items-center justify-center oneline'>
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                      })}

                      {!item.statut && (
                        <span className="flex h-2 w-2 rounded-full bg-red-600" />
                      )}
                  </div>

                  <div className='grid grid-cols-3 gap-2'>
                  <div className={cn("flex flex-col items-center  font-bold justify-center",
                          commande.selected === item.id && "text-white "
                        )}>
                      {item.annonce?.source?.length > 7 ?
                    `${item.annonce?.source?.substring(0, 7)}..`
                  :item.annonce?.source }
                    {/* <Flag code={item.annonce?.source.code} className="h-4 w-6" />  */}
                    </div>
                    <div className='flex items-center justify-center pt-2'>
                    <FaArrowRight/>
                    </div>
                    <div className={cn("flex flex-col items-center  font-bold justify-center",
                          commande.selected === item.id && "text-white "
                        )}>
                    {item.annonce?.destination?.length > 7 ?
                    `${item.annonce?.destination?.substring(0, 7)}..`
                  :item.annonce?.destination}
                    
                    {/* <Flag code={item.annonce?.code} className="h-4 w-6" />  */}
                    </div>
                    
                  </div>
                 

                    <div className="text-sm flex items-center justify-center  flex-row gap-2 font-bold p-1 w-full ">
                    
                      <div className={cn("text-sm text-red-700",
                          commande.selected === item.id && "text-white "
                        )}>
                            {item.statut}
                      </div>
                    </div> 
                   
                        
            </div>

            </div>



            {/*  {item.lieuCollecte.length > 21 
                                ? `${item.lieuCollecte.substring(0, 21)} ..` 
                                : item.lieuCollecte} */}

          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
