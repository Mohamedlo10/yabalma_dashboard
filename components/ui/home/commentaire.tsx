import { get5lastCommentaires, getCommentairesLength } from "@/app/api/commentaire/query";
import { Commente } from "@/app/dashboard/commentaires/schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Button } from "../button";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
function Commentaire() {

  // const [commentaire, setcommentaire] = useState<Commande[]>([]);
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()
  const [totalCommentaire, settotalCommentaire] = useState(0);
  const [commentaires, setCommentaires] = useState<Commente[]>([])



  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {

        const data: any = await get5lastCommentaires()
        const data2: any = await getCommentairesLength()
        console.log(data)

        if (data && data.length > 0) {
          console.log(data)
           setCommentaires(data)
          // setTotal(data.length); 
         
        }
        if (data2 && data2 >= 0) {
          console.log(data2)
          settotalCommentaire(data2)
        }
        
      } catch (error) {
        console.error("Error fetching room details:", error)
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
    <div>
        <Card x-chunk="dashboard-01-chunk-5 ">
            <CardHeader>
              <CardTitle>Derniers commentaires</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 mt-2">
            <div className="flex items-start px-4 gap-2 flex-col">
                {commentaires?.map((commentaire) => (
                  <div key={commentaire.id} className="flex items-center gap-2">
                    <Avatar className="hidden lg:h-12 lg:w-12 h-8 w-8 sm:flex">
                      <AvatarImage src={commentaire.client?.img_url ?? '/avatars/01.png'}  alt={`Avatar of ${commentaire.client?.nom}`} />
                      <AvatarFallback>{commentaire.client?.prenom[0]}{commentaire.client?.nom[0]}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="lg:text-base text-sm font-medium leading-none">
                        {commentaire.client?.prenom} {commentaire.client?.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {commentaire.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>


              <div className="flex items-center justify-center gap-1 mt-2">
                
                <div className="flex py-2 justify-center  rounded-full  text-red-700 font-bold xl:text-3xl sm:text-2xl tabular-nums">
                  +{totalCommentaire}
                </div>
                <div className="ml-auto font-medium">
                  <Button type="button" onClick={() => router.push('dashboard/commentaires')} className="w-fit h-10 font-bold text-[9px] xl:text-sm">Voir Commentaires</Button>
                </div>
              </div>
              
            </CardContent>
          </Card>   
    </div>
  )
}

export default Commentaire

