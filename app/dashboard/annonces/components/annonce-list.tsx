import { format, formatDistanceToNow } from 'date-fns';

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { fr } from 'date-fns/locale';
import { FaArrowRight } from 'react-icons/fa';
import Flag from "react-world-flags";
import { Annonce } from '../schema';
import { useAnnonce } from "../use-annonce";


interface annonceListProps {
  items: Annonce[]
}

export function AnnonceList({ items }: annonceListProps) {
  const [annonce, setAnnonce] = useAnnonce()

  return (
    <ScrollArea className="h-screen ">
      <div className="flex flex-col pb-80 gap-2 p-4 pt-0 ">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-row items-start gap-1 w-full rounded-lg border p-3 text-left text-sm transition-all  hover:bg-accent ",
              annonce.selected === item.id && "bg-red-600 hover:bg-red-600 "
            )}
            onClick={() =>
              setAnnonce({
                ...annonce,
                selected: item.id,
             })}>

            <div className="flex w-full items-center gap-6">
                <div className="flex flex-col w-36 items-center gap-1 ">
                                <Avatar className="hidden h-14 w-14  sm:flex">
                                <AvatarImage src={`${item.gp?.img_url}`} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                <AvatarFallback>GP</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className={cn("text-base font-bold leading-none text-red-700",
                                  annonce.selected === item.id && "text-white "
                                  )}>
                                {item.gp?.prenom} {item.gp?.nom}
                                </p>
                                </div>
                        

                                <div className={cn("line-clamp-2 font-bold text-xs text-muted-foreground",
                                    annonce.selected === item.id && "text-white "
                                  )}>
                                {item.lieuCollecte.length > 21 
                                ? `${item.lieuCollecte.substring(0, 21)} ..` 
                                : item.lieuCollecte}
                              </div>
                 
                </div> 
                
                <div className="flex flex-col font-bold h-full text-base w-1/2">
                    
                    <div className="text-sm flex items-center  flex-row gap-2 font-bold p-1 w-full ">
                      <div className={cn("font-bold text-sm text-muted-foreground",
                          annonce.selected === item.id && "text-white "
                        )}> Tarif</div>
                      <div className={cn("text-sm text-red-700",
                          annonce.selected === item.id && "text-white font-extrabold"
                        )}>
                        {item.tarif}
                      </div>
                    </div>
                    <div className="text-sm flex items-center  flex-row gap-2 font-bold p-1 w-full ">
                    <div className={cn("font-bold text-sm text-muted-foreground",
                          annonce.selected === item.id && "text-white "
                        )}> Limite depot</div>
                      <div className={cn("text-sm text-red-700",
                          annonce.selected === item.id && "text-white "
                        )}>
                      {`${format(new Date(item.limitDate), 'dd/MM/yy', { locale: fr })}`}
                      </div>
                    </div> 
                    <div className="text-sm flex items-center  flex-row gap-2 font-bold p-1 w-full ">
                      <div className={cn("font-bold text-sm text-muted-foreground",
                          annonce.selected === item.id && "text-white "
                        )}> Depart</div>
                      <div className={cn("text-sm text-red-700",
                          annonce.selected === item.id && "text-white "
                        )}>
                      {format(new Date(item.dateDepart), 'dd-MM-yy', { locale: fr })}
                      </div>
                    </div> 
                   
                </div>


            </div>



            <div
                  className={cn(
                    "ml-auto w-48 flex flex-col gap-4",
                    annonce.selected === item.id
                      ? "text-foreground"
                      : "text-muted-foreground")}>
                  <div className='text-xs flex flex-row gap-2 bg-white p-2  rounded-sm items-center justify-center oneline'>
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                      })}

                      {!item.read && (
                        <span className="flex h-2 w-2 rounded-full bg-red-600" />
                      )}
                  </div>

                  <div className='flex flex-row gap-2'>
                  <div className={cn("flex flex-col items-center w-12 font-bold justify-center",
                          annonce.selected === item.id && "text-white "
                        )}>
                      {item.paysDepart.pays.length > 4 ?
                    `${item.paysDepart.pays.substring(0, 4)}..`
                  :item.paysDepart.pays }
                    <Flag code={item.paysDepart.code} className="h-4 w-6" /> 
                    </div>
                    <div className='flex items-center justify-center pt-4'>
                    <FaArrowRight/>
                    </div>
                    <div className={cn("flex flex-col items-center w-12 font-bold justify-center",
                          annonce.selected === item.id && "text-white "
                        )}>
                    {item.paysArrive.pays.length > 4 ?
                    `${item.paysArrive.pays.substring(0, 4)}..`
                  :item.paysArrive.pays }
                    
                    <Flag code={item.paysArrive.code} className="h-4 w-6" /> 
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
