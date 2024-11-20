import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-bold leading-none ">Mohamed LO</p>
          <p className="text-sm font-bold text-muted-foreground">
            +221774126405
          </p>
        </div>
        <div className="ml-auto font-bold">+1500 FCFA</div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-bold leading-none">Astou Fall</p>
          <p className="text-sm font-bold text-muted-foreground">+221774663211</p>
        </div>
        <div className="ml-auto font-bold">-2000 FCFA</div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-bold leading-none">Astou Fall</p>
          <p className="text-sm font-bold text-muted-foreground">+221774663211</p>
        </div>
        <div className="ml-auto font-bold">+2000 FCFA</div>
      </div>

      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-bold leading-none">Astou Fall</p>
          <p className="text-sm font-bold text-muted-foreground">+221774663211</p>
        </div>
        <div className="ml-auto font-bold">-2500 FCFA</div>
      </div>

      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-bold leading-none">Mohamed LO</p>
          <p className="text-sm font-bold text-muted-foreground">
            +221774126405
          </p>
        </div>
        <div className="ml-auto font-bold">+1500 FCFA</div>
      </div>
      
    </div>
  )
}
