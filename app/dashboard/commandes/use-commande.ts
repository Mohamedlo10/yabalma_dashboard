import { atom, useAtom } from "jotai";
import { Commande } from './schema';

type Config = {
  selected: Commande["id"] | null;
  commandes: Commande[]; // Ajoute ici le tableau d'commandes
};

const configAtom = atom<Config>({
  selected: null, // Initialiser à null
  commandes: [], // Initialiser avec un tableau vide
});

export function useCommande() {
  return useAtom(configAtom);
}
