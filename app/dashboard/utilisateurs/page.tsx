"use client";
import { getUsersCount } from "@/app/api/users/route";
import ClientDiag from "@/components/ui/utilisateurs/clientDiag";
import ClientPays from "@/components/ui/utilisateurs/clientPays";
import GPDiag from "@/components/ui/utilisateurs/gpDiag";
import GpPays from "@/components/ui/utilisateurs/gpPays";
import UserClient from "@/components/ui/utilisateurs/userClient";
import UserGp from "@/components/ui/utilisateurs/userGp";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function Page() {
  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalActifs, setTotalActifs] = useState(0);
  const [totalnonActifs, setTotalnonActifs] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getUsersCount()

        if (data > 0) {
          setTotalUsers(data)
          setTotalActifs(data)
          setTotalnonActifs(0)
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
    <div className="flex flex-col h-[92vh] px-4 overflow-y-auto w-full">
      <div className="max-h-64 min-h-28 w-full flex justify-center md:gap-12 lg:gap-56 xl:gap-96 gap-auto items-center content-center p-1">
        <div className="flex flex-col justify-center items-center content-center">
          <p className="text-5xl text-red-600 font-bold">{totalUsers}</p>
          <p className="text-black font-bold">Utilisateurs</p>
        </div>
        <div className="flex flex-col justify-center items-center content-center">
          <p className="text-7xl text-red-600 font-bold">{totalActifs}</p>
          <p className="text-black font-bold">Actifs</p>
        </div>

        <div className="flex flex-col justify-center items-center content-center">
          <p className="text-5xl text-zinc-500 font-bold">{totalnonActifs}</p>
          <p className="text-black font-bold">Inactifs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 h-full w-full">
        <div className="grid grid-cols-10 h-full w-full">
          <div className="col-span-4 p-2 text-black ">
            <GpPays />
          </div>
          <div className="col-span-6 flex flex-row items-center justify-center">
            <div className="p-2 w-3/4">
            <GPDiag />
            </div>
            <div className="p-2 w-2/4">
              <UserGp />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-10 h-full w-full">
          <div className="col-span-4 p-2">
            <ClientPays />
          </div>
          <div className="col-span-6 flex flex-row items-center justify-center">
            <div className="p-2 w-3/4">
            <ClientDiag />
            </div>
            <div className="p-2 w-2/4">
              <UserClient />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
