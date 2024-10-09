
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
  { code: 'SN', name: 'Sénégal' },
  { code: 'FR', name: 'France' },
  // Ajoutez d'autres pays ici
];

export function AddAnnonce() {
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
        <CardTitle>Creer une annonce</CardTitle>
        <CardDescription>Publication d'une annonce</CardDescription>
      </CardHeader>
      <CardContent>
      <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 h-[31vh] px-2 w-full overflow-y-auto">
        {/* Tarif */}
        <FormField
          name="tarif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarif par Kg</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Entrez le tarif par kg" {...field} />
              </FormControl>
              <FormDescription>
                Tarif pour chaque kilogramme transporté.
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
              <FormLabel>Lieu de Collecte</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Lieu de collecte" {...field} />
              </FormControl>
              <FormDescription>
                Indiquez le lieu de collecte des colis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Limite */}
        <FormField
          name="limitDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Limite</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Date limite pour l’envoi des colis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date de Départ */}
        <FormField
          name="dateDepart"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de Départ</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Date et heure de départ du transport.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date d'Arrivée */}
        <FormField
          name="dateArrive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d'Arrivée</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Date et heure d'arrivée prévue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ID GP */}
        <div>
      {/* Champ de recherche */}
      <FormField
        name="searchGp"
        render={() => (
          <FormItem>
            <FormLabel>Rechercher un GP</FormLabel>
            <FormControl>
              <Input 
                type="search" 
                placeholder="Rechercher par prénom ou nom" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  fetchGpList(e.target.value); // Appeler la fonction de recherche
                }}
              />
            </FormControl>
            <FormDescription>
              Tapez le prénom ou le nom d'un GP pour le rechercher.
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Liste des GP récupérés */}
      <FormField
          name="idGp"
          render={({ field }) => (
            <FormItem className="flex flex-col ">
              <FormLabel>GP</FormLabel>
              <FormControl>
                <select className="h-12 border-2 rounded-sm bg-white p-2" {...field}>
                  {gpList.length > 0 ? (
                    gpList.map((gp: User) => (
                      <option key={gp.id} value={gp.id}>
                        {gp.prenom} {gp.nom}
                      </option>
                    ))
                  ) : (
                    <option disabled>Chargement des GPs...</option>
                  )}
                </select>
              </FormControl>
            <FormDescription>
              Sélectionnez le GP responsable.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/*  */}

      {/* Afficher un message de chargement si nécessaire */}
      {loading && <p>Chargement des GP...</p>}
    </div>


        {/* Pays de Départ */}
        <FormField
          name="paysDepart"
          render={({ field }) => (
            <FormItem className="flex flex-col ">
              <FormLabel>Pays de Départ</FormLabel>
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
                Sélectionnez le pays de départ.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pays d'Arrivée */}
        <FormField
          name="paysArrive"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Pays d'Arrivée</FormLabel>
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
                Sélectionnez le pays d'arrivée.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        {/* <Button type="submit">Ajouter l'annonce</Button> */}
      </form>
    </FormProvider>

      </CardContent>
      <CardFooter className="flex mt-6 justify-between">
        <Button className="h-10 font-bold" variant="outline">Cancel</Button>
        <Button className="h-10 font-bold" type="submit">Créer l'Annonce</Button>
      </CardFooter>
    </Card>
  )
}
