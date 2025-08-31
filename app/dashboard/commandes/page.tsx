"use client";

// import { cookies } from "next/headers";
import { getCommandesWithShop } from "@/app/api/commandes/query";
import { getSupabaseSession } from "@/lib/authMnager";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CommandeData } from "./components/commande";
import { type Commande } from "./schema";
import { useCommande } from "./use-commande";

export default function Page() {
  const [config, setConfig] = useCommande();
  const defaultLayout = [300, 200];
  const defaultCollapsed = false;
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data: any = await getCommandesWithShop();
        console.log(data);

        if (data && data.length > 0) {
          console.log(data);
          setCommandes(data);
        }

        const data3 = getSupabaseSession();
        if (data3 != null) {
          if (data3.access_groups?.commandes) {
            console.log("autoriser...");
          } else {
            router.push(`/dashboard`);
          }
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    }
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className=" flex-col h-full flex">
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
