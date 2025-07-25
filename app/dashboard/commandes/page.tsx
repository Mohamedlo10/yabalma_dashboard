"use client";

// import { cookies } from "next/headers";
import { getallcommandes } from "@/app/api/commandes/query";
import { getSupabaseSession } from "@/lib/authMnager";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { CommandeData } from "./components/commande";
import { type Commande } from "./schema";
import { useCommande } from "./use-commande";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function Page() {
  const [config, setConfig] = useCommande();
  const defaultLayout = [300, 200];
  const defaultCollapsed = false;
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data: any = await getallcommandes();
        console.log(data);

        if (data && data.length > 0) {
          console.log(data);
          setCommandes(data);
        }

        const data3 = getSupabaseSession();
        if (data3.access_groups?.commandes) {
          console.log("autoriser...");
        } else {
          router.push(`/dashboard`);
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-30">
        <div className="sweet-loading mb-4">
          <BeatLoader
            color={color}
            loading={isLoading}
            cssOverride={override}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
        <div className="text-white text-lg font-semibold animate-pulse">
          Chargement des commandes…
        </div>
      </div>
    );
  }

  // Affichage mobile : liste ou empty state
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    if (commandes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-8">
          <Image
            src="/empty-state.svg"
            width={200}
            height={200}
            alt="Aucune commande"
            className="mb-6"
          />
          <div className="text-xl font-semibold mb-2">
            Aucune commande trouvée
          </div>
          <div className="text-gray-500 mb-6 text-center">
            Vous n'avez pas encore de commandes. Créez-en une pour commencer !
          </div>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition">
            Créer une commande
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col h-full w-full p-2 gap-2">
        {commandes.map((commande) => (
          <div
            key={commande.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border-l-4 border-red-600"
          >
            <div className="flex items-center gap-3">
              <Image
                src={commande.client?.img_url || "/avatar-default.svg"}
                width={40}
                height={40}
                alt="Avatar"
                className="rounded-full"
              />
              <div>
                <div className="font-bold text-red-700">
                  {commande.client?.prenom} {commande.client?.nom}
                </div>
                <div className="text-xs text-gray-500">
                  {commande.client?.Tel}
                </div>
              </div>
              <span
                className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${
                  commande.statut === "Livré"
                    ? "bg-green-100 text-green-700"
                    : commande.statut === "Annulé"
                    ? "bg-gray-200 text-gray-500"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {commande.statut || "En cours"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>{commande.annonce?.source}</span>
              <span>→</span>
              <span>{commande.annonce?.destination}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-gray-100 text-gray-700 py-1 rounded hover:bg-gray-200">
                Voir
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-1 rounded hover:bg-gray-200">
                Éditer
              </button>
            </div>
          </div>
        ))}
        <button className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl hover:bg-red-700 transition">
          +
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col h-full md:flex">
        <CommandeData
          commandes={commandes}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  );
}
