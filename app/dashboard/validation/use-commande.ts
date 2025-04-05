// Modifiez useCommande.ts pour ajouter les stats
import { atom, useAtom } from "jotai";
import { Commande } from "./schema";
import { getCommandesStats } from "@/app/api/commandes/query";

type Config = {
  selected: Commande["id"] | null;
  commandes: Commande[];
  stats: {
    totalCommandes: number;
    commandesValidees: number;
    commandesNonValidees: number;
  };
};

const configAtom = atom<Config>({
  selected: null,
  commandes: [],
  stats: {
    totalCommandes: 0,
    commandesValidees: 0,
    commandesNonValidees: 0,
  },
});

// Atomes dérivés pour les actions
const updateStatsAtom = atom(
  null, // getter non utilisé pour un atome d'écriture
  async (get, set) => {
    try {
      const data = await getCommandesStats();
      set(configAtom, {
        ...get(configAtom),
        stats: {
          totalCommandes: data.totalCommandes,
          commandesValidees: data.commandesValidees,
          commandesNonValidees: data.commandesNonValidees,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des statistiques:", error);
    }
  }
);

export function useCommande() {
  return useAtom(configAtom);
}

export function useUpdateStats() {
  return useAtom(updateStatsAtom);
}
