"use client";

import { BarChartComponent } from "@/components/ui/home/bar-chart";
import Commande from "@/components/ui/home/commande";
import Commentaire from "@/components/ui/home/commentaire";
import CirculaireComponent from "@/components/ui/home/utilisateurs-chart";
import ClientPays from "@/components/ui/utilisateurs/clientPays";
import GpPays from "@/components/ui/utilisateurs/gpPays";
import { getSupabaseSession, getSupabaseUser } from "@/lib/authMnager";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { User } from "./accounts/schema";
import { Role } from "./settings/schema";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [role, setRole] = useState<Role>();
  const [user, setUser] = useState<User>();

  const router = useRouter();
  async function fetchData() {
    setIsLoading(true);
    try {
      setRole(getSupabaseSession());
      const data = getSupabaseUser();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
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

  return (
    <div className="h-full w-full p-2 sm:p-4 lg:p-6">
      <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
        {/* Colonne gauche */}
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 h-full">
          {/* Section Finance ou Bienvenue */}
          <div className="flex-1 min-h-0">
            {role?.access_groups.finance ? (
              <div className="h-full">
                <BarChartComponent />
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
                  <Image
                    src="/yabalma.jpg"
                    alt="Logo Yabalma"
                    fill
                    style={{ objectFit: "cover" }}
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-serif font-extrabold text-red-800 mt-4 text-center">
                  Bienvenue {user?.user_metadata?.prenom}{" "}
                  {user?.user_metadata?.nom}
                </div>
              </div>
            )}
          </div>

          {/* Section Utilisateurs */}
          {role?.access_groups.utilisateurs && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 h-48 sm:h-56 lg:h-64">
              <div className="h-full">
                <ClientPays />
              </div>
              <div className="h-full">
                <GpPays />
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 h-full">
          {/* Section Utilisateurs/Commentaires ou Bienvenue */}
          <div className="flex-1 min-h-0">
            {role?.access_groups.utilisateurs ||
            role?.access_groups.commentaires ||
            !role?.access_groups.finance ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 h-full">
                <div className="h-full">
                  {role?.access_groups.utilisateurs ? (
                    <CirculaireComponent />
                  ) : (
                    <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">
                        Aucun graphique
                      </span>
                    </div>
                  )}
                </div>
                <div className="h-full">
                  {role?.access_groups.commentaires ? (
                    <Commentaire />
                  ) : (
                    <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">
                        Aucun graphique
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
                  <Image
                    src="/yabalma.jpg"
                    alt="Logo Yabalma"
                    fill
                    style={{ objectFit: "cover" }}
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-serif font-extrabold text-red-800 mt-4 text-center">
                  Bienvenue {user?.user_metadata?.prenom}{" "}
                  {user?.user_metadata?.nom}
                </div>
              </div>
            )}
          </div>

          {/* Section Annonces/Commandes */}
          {(role?.access_groups.annonces || role?.access_groups.commandes) && (
            <div className="h-48 sm:h-56 lg:h-64">
              <Commande />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
