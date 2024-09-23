import Login from "@/components/ui/login"
import Image from "next/image"



export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image."

  export default function home() {
  return (
    <div className="w-full lg:grid lg:min-h-[800px]  bg-zinc-800 lg:grid-cols-2 xl:h-[100vh]">
      <div className="flex items-center justify-center py-12">
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
    </div>
  )
}
