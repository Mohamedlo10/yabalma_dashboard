import { atom, useAtom } from "jotai";
import { Annonce } from './schema';

type Config = {
  selected: Annonce["id"] | null;
  annonces: Annonce[]; // Ajoute ici le tableau d'annonces
};

const configAtom = atom<Config>({
  selected: null, // Initialiser à null
  annonces: [], // Initialiser avec un tableau vide
});

export function useAnnonce() {
  return useAtom(configAtom);
}
