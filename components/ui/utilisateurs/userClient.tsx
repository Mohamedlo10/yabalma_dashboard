"use client";
import { geTopClient } from "@/app/api/clients/query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Button } from "../button";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export function UserClient() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  let [color, setColor] = useState("#ffffff");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data: any = await geTopClient();

        if (data != null) {
          setClient(data);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
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
  const router = useRouter();
  return (
    <Card className="flex flex-col p-4">
      <CardHeader className="items-start p-2">
        <CardTitle className="text-red-600 font-black text-xl md:text-3xl">
          Clients
        </CardTitle>
      </CardHeader>

      {client && (
        <CardContent className=" xl:pl-6 flex-1 grid grid-cols-2 gap-6 w-full p-0 md:p-1">
          <div>
            <Image
              src="/ClientLOGO.png"
              alt="Image"
              width={890}
              height={590}
              className="md:h-32 md:w-32 h-20 w-20  object-cover dark:brightness-[0.2] dark:grayscale"
            />
            {/*     <div className="flex flex-col justify-center items-center content-center">
          <p className="text-xl text-red-600 font-bold">20012</p>
          <p className="text-black font-bold">Clients</p>
        </div>
 */}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="w-full flex justify-center items-center font-bold py-2">
                <div className="md:text-base text-xs">Top Client</div>
              </div>
              <div className="flex flex-col items-center gap-2 ">
                <Avatar className="hidden h-14 w-14  sm:flex">
                  <AvatarImage
                    src={client.img_url}
                    className="rounded-full object-cover w-full h-full"
                    alt="Avatar"
                  />
                  <AvatarFallback>ML</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="md:text-base text-[11px] leading-none">
                    {client.prenom} {client.nom}
                  </p>
                </div>
              </div>
            </div>
            <div className="items-end w-full justify-center flex">
              <button
                type="button"
                onClick={() => router.push("utilisateurs/Clients")}
                className="w-fit min-w-16 bg-black rounded-sm text-white text-[9px] md:text-base h-10 font-bold"
              >
                Voir les Clients
              </button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
export default UserClient;
