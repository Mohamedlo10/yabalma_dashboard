"use client";
import { modifierAnnonce, supprimerAnnonce } from '@/app/api/annonces/route';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/dialogConfirm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Save, Trash2, UserRound, UserRoundPen, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useState } from 'react';
import { Annonce } from '../schema';

type PersonalInfoProps = {
  annonce: Annonce | null | undefined;
};

const PersonalInfo: React.FC<PersonalInfoProps> = ({ annonce }) => {
  const [editMode, seteditMode] = useState(false);
  const activeEdit = () => {
  seteditMode(!editMode)
}  
const router = useRouter();
const [isDialogOpen, setDialogOpen] = useState(false);
const [ActuAnnonce, setAnnonce] = useState({
  ...annonce,
  source: annonce?.source || "",
  destination: annonce?.destination || "",
  stock_annonce: annonce?.stock_annonce || "",
  poids_max: annonce?.poids_max || "",
  is_boost: annonce?.is_boost || false,
  type_transport: annonce?.type_transport || "",
  lieu_depot: annonce?.lieu_depot || "",
  statut: annonce?.statut || "",
  date_depart: annonce?.date_depart || "",
  date_arrive: annonce?.date_arrive || "",
  



});


const handleInputChange = (e : ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setAnnonce({ ...ActuAnnonce, [name]: value });
};


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log(ActuAnnonce)
  try {
    delete ActuAnnonce.client;
  const response = await modifierAnnonce(ActuAnnonce.id_annonce,ActuAnnonce)
  console.log("Reussi")
  seteditMode(false)

  } catch (error) {
    console.error("Erreur lors de la modification de l'annonce:", error);
  } 
};

const deleteUser = async () => {
  try{
    const response = await supprimerAnnonce(ActuAnnonce.id_annonce)
    console.log("Suppression reussi")
    router.back();

  }catch(error)
  {
    console.error("Erreur lors de la Suppression de l'annonce:", error); 
  }
}




  return <div>
            <div className='p-3 bg-zinc-50 rounded-md w-full items-center justify-start flex flex-col gap-1'>  
            <div className="flex flex-col  max-h-[53vh]">

     

        <div>
          <div className="flex items-center my-4">
          <UserRound />
          <div className="ml-2 text-black text-sm sm:text-xl font-bold">Informations</div>
          </div>

          { editMode && annonce ?(
            <form className="w-full mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-36 rounded-lg">
            {/* <!-- First Bloc --> */}
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Depart</div>
                  <input
                      type="text"
                      name="source"
                      value={ActuAnnonce.source}
                      onChange={handleInputChange}
                      placeholder="Depart"
                      className="border p-2 rounded w-full"
                      required
                    />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Destination</div>
                <input
                    type="text"
                    name="destination"
                    value={ActuAnnonce.destination}
                    onChange={handleInputChange}
                    placeholder="destination"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Stock annonce</div>
                <input
                    type="text"
                    name="stock_annonce"
                    value={ActuAnnonce.stock_annonce}
                    onChange={handleInputChange}
                    placeholder="Stock"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
           
            </div>
            {/* <!-- Second Bloc --> */}
            <div className="p-4">
            <div className="mb-4">
              <div className="text-gray-500 text-sm sm:text-base">Boost</div>
              <select
                name="is_boost"
                value={ActuAnnonce.is_boost ? "true" : "false"} // Convertit le boolean en chaîne
                onChange={(e) =>
                  setAnnonce((prevState) => ({
                    ...prevState,
                    is_boost: e.target.value === "true", // Convertit la chaîne en boolean
                  }))
                }
                className="border p-2 rounded w-full"
                required
              >
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Poids max</div>
                <input
                    type="text"
                    name="poids_max"
                    value={ActuAnnonce.poids_max}
                    onChange={handleInputChange}
                    placeholder="Poids max"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Type de Transport</div>
                <input
                    type="text"
                    name="type_transport"
                    value={ActuAnnonce.type_transport}
                    onChange={handleInputChange}
                    placeholder="Type de Transport"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Statut</div>
                <input
                    type="text"
                    name="statut"
                    value={ActuAnnonce.statut}
                    onChange={handleInputChange}
                    placeholder="Statut"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
            


          
             

            </div>


            {/* last bloc */}
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Date de Depart</div>
                <input
                    type="date"
                    name="date_depart"
                    value={ActuAnnonce.date_depart}
                    onChange={handleInputChange}
                    placeholder="Depart"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Date d'arrivee</div>
                <input
                    type="date"
                    name="date_arrive"
                    value={ActuAnnonce.date_arrive}
                    onChange={handleInputChange}
                    placeholder="Arrivee"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Lieu de depot</div>
                <input
                    type="text"
                    name="lieu_depot"
                    value={ActuAnnonce.lieu_depot}
                    onChange={handleInputChange}
                    placeholder="Lieu de depot"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12">

                <Button onClick={activeEdit} className='font-bold bg-white hover:text-slate-900 hover:bg-slate-100 text-slate-600  gap-2'>
                  <X />
                    Annuler
                  </Button>
                  <Button type="submit" className='font-bold gap-2 '>
                  <Save />
                    Enregistrer
                  </Button>

          </div> 

            </form>

          
          ):(   
            <div className='mb-6'>      
            <div className="grid grid-cols-3 gap-36 rounded-lg">
            {/* <!-- First Bloc --> */}
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Depart</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{ActuAnnonce?.source}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Destination</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{ActuAnnonce?.destination}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Type de Transport</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{ActuAnnonce?.type_transport}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Date de publication</div>
               {annonce? ( <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{format(new Date(annonce?.created_at), 'dd MMMM yyyy', { locale: fr })}
                {` à ${format(new Date(annonce?.created_at), 'HH:mm')}`}</div>):
                (
                  <div className='text-8xl'>Erreur lors du chargement des donnees</div>
                )}
              </div>
           
            </div>
            {/* <!-- Second Bloc --> */}
            <div className="p-4">
            <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Boost</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{ActuAnnonce.is_boost ? "Oui" : "Non"} </div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Poids max</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{ActuAnnonce?.poids_max}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">stock</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{ActuAnnonce?.stock_annonce}</div>
              </div>
             
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Statut</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{ActuAnnonce?.statut}</div>
              </div>
             
              
              
              
            </div>
             {/* <!-- Last Bloc --> */}
             <div className="p-4">
             <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Date de depart</div>
               {annonce? ( <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{format(new Date(annonce?.date_depart), 'dd MMMM yyyy', { locale: fr })}
                {` à ${format(new Date(annonce?.date_depart), 'HH:mm')}`}</div>):
                (
                  <div className='text-8xl'>Erreur lors du chargement des donnees</div>
                )}
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Date d'arrivee</div>
               {annonce? ( <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{format(new Date(annonce?.date_arrive), 'dd MMMM yyyy', { locale: fr })}
                {` à ${format(new Date(annonce?.date_arrive), 'HH:mm')}`}</div>):
                (
                  <div className='text-8xl'>Erreur lors du chargement des donnees</div>
                )}
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Lieu de depot</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{ActuAnnonce?.lieu_depot}</div>
              </div>
            </div>

          </div>
          <div className="grid grid-cols-2 gap-12">


  <Button onClick={() => setDialogOpen(true)} className='font-bold gap-2 bg-red-700 hover:bg-red-800'>
    <Trash2 />
      Supprimer
  </Button>
  <Button onClick={activeEdit} className='font-bold gap-2'>

  <UserRoundPen />
    Modifier
  </Button>
  <ConfirmDialog
      isOpen={isDialogOpen}
      message={`Etes-vous sûr de vouloir supprimer l'annonce de ${ActuAnnonce.client?.prenom}  ${ActuAnnonce.client?.nom} ?`}
      onConfirm={() => {
        deleteUser();
        setDialogOpen(false);
      }}
      onCancel={() => setDialogOpen(false)}
    />


</div>
          </div>)
          }
        </div>

      </div>
                    
            </div>
  </div>;
};

export default PersonalInfo;
