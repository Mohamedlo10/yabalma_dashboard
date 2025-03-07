"use client"
import { getTopGp } from "@/app/api/gp/query"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CSSProperties, useEffect, useState } from "react"
import BeatLoader from "react-spinners/BeatLoader"
import { Button } from "../button"

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export function UserGp() {

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gp, setGp] = useState<any| null>(null);
  let [color, setColor] = useState("#ffffff");


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getTopGp()
        if (data!=null) {
          setGp(data)         
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
  const router = useRouter()
  return (
    <Card className="flex flex-col p-4">
      <CardHeader className="items-start p-2"> 
        <CardTitle className="text-red-600 font-black text-3xl">GP</CardTitle>
      </CardHeader>

      <CardContent className=" flex-1 grid grid-cols-2 gap-6 w-full p-1"> 
      
        <div>
       
        <Image
          src="/gpLOGO.png"
          alt="Image"
          width={890} 
          height={590}
          className="h-32 w-32 object-cover dark:brightness-[0.2] dark:grayscale"
        />
       
           
        </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                   {/*  <div className="flex flex-col justify-center items-center content-center">
                      <p className="text-xl text-red-600 font-bold">3590</p>
                      <p className="text-black font-bold">GP</p>
                    </div> */}
                            <div className="w-full flex justify-center items-center font-bold py-2">
                                <div>Top GP</div>
                            </div>
                            <div className="flex flex-col items-center gap-2 ">
                                <Avatar className="hidden h-14 w-14  sm:flex">
                                <AvatarImage src={gp.img_url} className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                <AvatarFallback>SF</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-base font-bold leading-none">
                                    {gp.prenom} {gp.nom}
                                </p>
                                </div>
                            </div> 
                            
                    </div>
                    <div className="items-end w-full justify-center flex">
                        <Button type="button" onClick={() => router.push('utilisateurs/gp')} className="w-fit h-10 font-bold">Voir les GP</Button>
                    </div>
                    
                </div>

      </CardContent>
    </Card>
  )
}
export default UserGp