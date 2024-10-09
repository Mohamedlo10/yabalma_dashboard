import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    Card,
    CardContent
} from "@/components/ui/card"


function TopGC() {
  return (
    <div>
        <Card x-chunk="dashboard-01-chunk-5 ">
            {/* <CardHeader className="items-center w-full">
              <CardTitle>Top GP</CardTitle>
            </CardHeader> */}
            <CardContent className="grid grid-cols-1 gap-8   mt-2">

        <div className="flex flex-col">
        <div className="w-full flex justify-center items-center py-4 font-bold">
            <div>Top GP</div>
        </div>

                    <div className="grid grid-cols-3 gap-4 mt-2">
                            <div className="flex flex-col items-center gap-4 ">
                                <Avatar className="hidden h-14 w-14 sm:flex">
                                <AvatarImage src="/avatars/01.png" className="object-cover" alt="Avatar" />
                                <AvatarFallback>MD</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-sm font-bold leading-none">
                                    Miniane Diouf
                                </p>
                                </div>
                            </div> 
                            <div className="flex flex-col items-center gap-4 ">
                                <Avatar className="hidden h-16 w-16 sm:flex">
                                <AvatarImage src="/avatars/02.png" className="object-cover" alt="Avatar" />
                                <AvatarFallback>SF</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-sm font-bold leading-none">
                                    Safietou Fall
                                </p>
                                </div>
                            </div> 
                            
                            <div className="flex flex-col items-center gap-4 ">
                                <Avatar className="hidden h-14 w-14 sm:flex">
                                <AvatarImage src="/avatars/01.png" className="object-cover" alt="Avatar" />
                                <AvatarFallback>MD</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-sm font-bold leading-none">
                                    Miniane Diouf
                                </p>
                                </div>
                            </div> 
                    </div>
        </div>


        <div className="flex flex-col">
                    <div className="w-full flex justify-center items-center py-4 font-bold">
                        <div>Top Trajet</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                            <div className="flex flex-col items-center gap-4 ">
                                <Avatar className="hidden h-14 w-14 sm:flex">
                                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                <AvatarFallback>MD</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-base font-medium leading-none">
                                    Miniane Diouf
                                </p>
                                </div>
                            </div> 
                            <div className="flex flex-col items-center gap-4 ">
                                <Avatar className="hidden h-16 w-16 sm:flex">
                                <AvatarImage src="/avatars/02.png" className="object-cover" alt="Avatar" />
                                <AvatarFallback>SF</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-base font-medium leading-none">
                                    Safietou Fall
                                </p>
                                </div>
                            </div> 
                            
                            <div className="flex flex-col items-center gap-4 ">
                                <Avatar className="hidden h-14 w-14 sm:flex">
                                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                <AvatarFallback>MD</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                <p className="text-base font-medium leading-none">
                                    Miniane Diouf
                                </p>
                                </div>
                            </div> 
                    </div>
        </div>
            
           


            {/*   <CardFooter className="grid grid-cols-2 items-center gap-1 text-sm p-2"> 
                <div>
                  <CardTitle className="text-zinc-500 font-bold text-3xl">2 090</CardTitle>
                  <CardTitle>Abandons</CardTitle>
                </div>
                <Button className="w-fit h-10 font-bold">Gerer les Utilisateurs</Button>
              </CardFooter> */}
              
            </CardContent>
          </Card> 
         
    </div>
  )
}

export default TopGC