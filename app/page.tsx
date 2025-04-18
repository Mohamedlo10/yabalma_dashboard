import Login from "@/components/ui/login";
import Image from "next/image";

export default function home() {
  return (
    <div className="w-full lg:grid h-screen  bg-zinc-800 lg:grid-cols-2 ">
      <div className="flex overflow-x-hidden items-center h-full justify-center ">
        <Login />
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
  );
}
