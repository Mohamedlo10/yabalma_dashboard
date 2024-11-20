"use client";
import { modifierClient, supprimerClient } from '@/app/api/clients/query';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/dialogConfirm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Save, Trash2, UserRound, UserRoundPen, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useState } from 'react';
import { User } from '../../schema';

type PersonalInfoProps = {
  user: User | null | undefined;
};

const PersonalInfo: React.FC<PersonalInfoProps> = ({ user }) => {
  const [editMode, seteditMode] = useState(false);
  const activeEdit = () => {
  seteditMode(!editMode)
}  
const router = useRouter();
const [isDialogOpen, setDialogOpen] = useState(false);
const [client, setClient] = useState({
  ...user,
  prenom: user?.prenom || "",
  nom: user?.nom || "",
  Tel: user?.Tel || "",
  Pays: user?.Pays || "",
  ville: user?.ville || "",
  img_url: user?.img_url || "",
});


const handleInputChange = (e : ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setClient({ ...client, [name]: value });
};


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log(client)
  try {
  const response = await modifierClient(client.id_client,client)
  console.log("Reussi")
  seteditMode(false)

  } catch (error) {
    console.error("Erreur lors de la modification du client:", error);
  } 
};

const deleteUser = async () => {
  try{
    const response = await supprimerClient(client.id_client)
    console.log("Suppression reussi")
    router.back();

  }catch(error)
  {
    console.error("Erreur lors de la Suppression du client:", error); 
  }
}




  return <div>
            <div className='p-3 bg-zinc-50 rounded-md w-full items-center justify-start flex flex-col gap-1'>  
            <div className="flex flex-col  max-h-[40vh]">

     

        <div>
          <div className="flex items-center my-4">
          <UserRound />
          <div className="ml-2 text-black text-sm sm:text-xl font-bold">Informations personnelles</div>
          </div>

          { editMode && user ?(
            <form className="w-full mb-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-36 rounded-lg">
            {/* <!-- First Bloc --> */}
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Prenom</div>
                  <input
                      type="text"
                      name="prenom"
                      value={client.prenom}
                      onChange={handleInputChange}
                      placeholder="Prénom"
                      className="border p-2 rounded w-full"
                      required
                    />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Nationalite</div>
                <input
                    type="text"
                    name="Pays"
                    value={client.Pays}
                    onChange={handleInputChange}
                    placeholder="Pays"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Telephone</div>
                <input
                    type="tel"
                    name="Tel"
                    value={client.Tel}
                    onChange={handleInputChange}
                    placeholder="Téléphone"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
            </div>
            {/* <!-- Second Bloc --> */}
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Nom</div>
                <input
                    type="text"
                    name="nom"
                    value={client.nom}
                    onChange={handleInputChange}
                    placeholder="Nom"
                    className="border p-2 rounded w-full"
                    required
                  />
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Ville</div>
                <input
                    type="text"
                    name="ville"
                    value={client.ville}
                    onChange={handleInputChange}
                    placeholder="Ville"
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
            <div className="grid grid-cols-2 gap-36 rounded-lg">
            {/* <!-- First Bloc --> */}
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Prenom</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{client?.prenom}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Nationalite</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{client?.Pays}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Telephone</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{client?.Tel}</div>
              </div>
            </div>
            {/* <!-- Second Bloc --> */}
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Nom</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{client?.nom}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Ville</div>
                <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{client?.ville}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm sm:text-base">Date d'inscription</div>
               {user? ( <div className="leading-6 mt-1 text-sm sm:text-base font-bold">{format(new Date(user?.created_at), 'dd MMMM yyyy', { locale: fr })}
                {` à ${format(new Date(user?.created_at), 'HH:mm')}`}</div>):
                (
                  <div className='text-8xl'>Erreur lors du chargement des donnees</div>
                )}
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
      message={`Etes-vous sûr de vouloir supprimer ${client.nom} ?`}
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
