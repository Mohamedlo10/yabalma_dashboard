import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "../button"


function Commentaire() {
  return (
    <div>
        <Card x-chunk="dashboard-01-chunk-5 ">
            <CardHeader>
              <CardTitle>Top Commentaires</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 mt-2">
              <div className="flex items-center gap-4 ">
                <Avatar className="hidden h-12 w-12 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-base font-medium leading-none">
                    Miniane Diouf
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dayye Daww rek amoul arret
                  </p>
                </div>
              </div>


              <div className="flex items-center gap-4 ">
                <Avatar className="hidden h-12 w-12 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-base font-medium leading-none">
                    Miniane Diouf
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dayye Daww rek amoul arret
                  </p>
                </div>
              </div>
            

              <div className="flex items-center gap-4">
                <Avatar className="hidden h-12 w-12 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-base font-medium leading-none">
                    Miniane Diouf
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dayye Daww rek amoul arret
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="hidden h-12 w-12 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-base font-medium leading-none">
                    Miniane Diouf
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dayye Daww rek amoul arret
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="hidden h-12 w-12 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-base font-medium leading-none">
                    Miniane Diouf
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dayye Daww rek amoul arret
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2x">
                
                <div className="grid gap-0 ml-4">
                  <p className="flex py-2 justify-center  rounded-full    gap-1 text-red-700 font-bold text-4xl tabular-nums">
                    +62
                  </p>
                  <p className=""> 
                   {/*  <span className="text-sm font-normal tracking-normal text-muted-foreground">
                    Commentaires
                    </span> */}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Button className="w-fit h-10 font-bold">Voir Commentaires</Button>
                </div>
              </div>
              
            </CardContent>
          </Card>   
    </div>
  )
}

export default Commentaire

