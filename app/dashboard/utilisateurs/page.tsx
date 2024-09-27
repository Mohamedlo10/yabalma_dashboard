"use client";
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

  useEffect(() => {
    // Simulate a loading period (e.g., fetching data)
    setTimeout(() => {
      setIsLoading(false);
    },0); // Change this duration as needed
  }, []);

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
          <p className="text-5xl text-red-600 font-bold">25692</p>
          <p className="text-black font-bold">Utilisateurs</p>
        </div>
        <div className="flex flex-col justify-center items-center content-center">
          <p className="text-7xl text-red-600 font-bold">23602</p>
          <p className="text-black font-bold">Actifs</p>
        </div>

        <div className="flex flex-col justify-center items-center content-center">
          <p className="text-5xl text-zinc-500 font-bold">2090</p>
          <p className="text-black font-bold">Inactifs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 h-full w-full">
        <div className="grid grid-cols-10 h-full w-full">
          <div className="col-span-4 p-2 text-black ">
            <GPDiag />
          </div>
          <div className="col-span-6 py-2 flex flex-row items-center justify-center">
            <div className="p-2 w-2/3">
              <GpPays />
            </div>
            <div className="p-2 w-1/3">
              <UserGp />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-10 h-full w-full">
          <div className="col-span-4 p-2">
            <ClientDiag />
          </div>
          <div className="col-span-6 py-2 flex flex-row items-center justify-center">
            <div className="p-2 w-2/3">
              <ClientPays />
            </div>
            <div className="p-2 w-1/3">
              <UserClient />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
