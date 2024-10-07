
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { User } from "../../utilisateurs/gp/data/schema";


import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";

const countries = [
  { code: 'FR', name: 'Dakar-Paris' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'FR', name: 'France' },
  // Ajoutez d'autres pays ici
];

export function AddCommande() {
  const [tarif, setTarif] = useState('');
  const [lieuCollecte, setLieuCollecte] = useState('');
  const [limitDate, setLimitDate] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [dateArrive, setDateArrive] = useState('');
  const [idGp, setIdGp] = useState<string | undefined>('');
  const [gpList, setGpList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [selectedCountryDepart, setSelectedCountryDepart] = useState('');
  const [selectedCountryArrive, setSelectedCountryArrive] = useState('');
  const methods = useForm(); 
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;


    const fetchGpList = async (term:string) => {
      if (!term) {
        setGpList([]); 
        return;
      }
  // 
      setLoading(true);

      try {
        const response = await fetch(`/api/gp?page=1&pageSize=6&search=${encodeURIComponent(term)}`); // Ajustez l'URL de l'API
        if (!response.ok) {
          throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }
        const data = await response.json();
        const gpArray:User[] = Object.values(data); 
        console.log(gpArray);
        setGpList(gpArray);
        
       /*  let gpList User[];
        if (Array.isArray(data)) {
          gpList = data; // Si c'est déjà un tableau
        } else if (data && typeof data === 'object') {
          gpList = Object.values(data); 
        } */
      } catch (error) {
        console.error('Erreur lors de la récupération de la liste des GP:', error);
      } 
      finally{
        setLoading(false); 
      }
    };
  

  /*
   let gpList = [];
        if (Array.isArray(data)) {
          gpList = data; // Si c'est déjà un tableau
        } else if (data && typeof data === 'object') {
          gpList = Object.values(data); // Convertir en tableau
        }
  */
  
  

  const onSubmit = (data: any) => {
    console.log('Form Data:', data);
  };


  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Faire une commande</CardTitle>
        <CardDescription>Soumettre une commande</CardDescription>
      </CardHeader>
      <CardContent>
      <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 h-[31vh] px-2 w-full overflow-y-auto">
         {/* Pays d'Arrivée */}
         <FormField
          name="paysArrive"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Selectionner une Annonce</FormLabel>
              <FormControl>
                <select className="h-14 border-2 rounded-sm bg-white p-2" {...field}>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code} {country.name} 
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Sélectionnez une annonce
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        {/* Lieu de Collecte */}
        <FormField
          name="lieuCollecte"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinataire</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Destinataire" {...field} />
              </FormControl>
              <FormDescription>
                Indiquez le destinataire des colis prenom et nom.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

      <FormField
          name="lieuCollecte"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse de Livraison</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Adresse de Livraison" {...field} />
              </FormControl>
              <FormDescription>
                Indiquez le Adresse de Livraison des colis .
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

      <FormField
          name="lieuCollecte"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numero de telephone</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Numero de telephone" {...field} />
              </FormControl>
              <FormDescription>
                Indiquez le numero de telephone du destinataire des colis .
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

     



        {/* ID GP */}
        <div>
   
      {/*  */}

      {/* Afficher un message de chargement si nécessaire */}
      {loading && <p>Chargement des GP...</p>}
    </div>

        {/* Submit Button */}
        {/* <Button type="submit">Ajouter l'commande</Button> */}
      </form>
    </FormProvider>

      </CardContent>
      <CardFooter className="flex mt-6 justify-between">
        <Button className="h-10 font-bold" variant="outline">Cancel</Button>
        <Button className="h-10 font-bold" type="submit">Faire une commande</Button>
      </CardFooter>
    </Card>
  )
}
