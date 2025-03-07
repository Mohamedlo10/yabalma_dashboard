import Login from "@/components/ui/login"
import Image from "next/image"


  export default function home() {
  return (
    <div className="w-full lg:grid h-[100vh]  bg-zinc-800 lg:grid-cols-2 ">
      <div className="lg:flex items-center hidden h-full justify-center py-12">
        <Login/>
      </div>
      <div className="hidden px-8 bg-gray-50 lg:block">
        <Image
          src="/logoYabalma.svg"
          alt="Image"
          width={890} 
          height={890}
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="h-96 md:hidden flex items-center justify-center w-full text-2xl font-extrabold">
        VERSION MOBILE NON DISPONIBLE
      </div>
    </div>
  )
}
