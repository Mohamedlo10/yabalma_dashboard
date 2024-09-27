"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartConfig
} from "@/components/ui/chart"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "../button"
export const description = "A stacked bar chart with a legend"
const chartData = [
  { nom: "GP", actifs: 3450, inactifs: 1200 },
  { nom: "Client", actifs: 10380, inactifs: 3420 },
]
const chartConfig = {
  actifs: {
    label: "actifs",
    color: "#dc2626",
    icon: User,
  },
  inactifs: {
    label: "inactifs",
    color: "#4D4D4D",
    icon: User,
  },
} satisfies ChartConfig


export function UserGp() {
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
                                <AvatarImage src="/avatars/02.png" className="rounded-full object-cover w-full h-full" alt="Avatar" />
                                <AvatarFallback>SF</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-base font-bold leading-none">
                                    Safietou Fall
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