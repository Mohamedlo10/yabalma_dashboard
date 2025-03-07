"use client";

import { creerClient, getallclient, uploadFile } from "@/app/api/clients/query";
import { Button } from "@/components/ui/button";

import Drawer from '@mui/material/Drawer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus } from "lucide-react";
import { useRouter } from 'next/navigation';

import { getSupabaseSession } from "@/lib/authMnager";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { ToastContainer } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red", 
};
// Composant principal de la page des utilisateurs
export default function Page() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  let [color, setColor] = useState("#ffffff");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [client, setClient] = useState({
    prenom: "",
    nom: "",
    Tel: "",
    Pays: "",
    ville: "",
    img_url: "",
    id_client:"",
  });
  const router = useRouter();

    const handleNavigation = (idUser:string) => {
      // Par exemple, naviguer vers la page de profil en passant l'ID de l'utilisateur en paramètre
      router.push(`/dashboard/utilisateurs/Clients/profile?id=${idUser}`);
    };
  

    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getallclient()
        if (data && data.length > 0) {
          setUsers(data)
          setTotal(data.length);
         console.log(data)
        }
        const data3= getSupabaseSession()
        if (data3 != null) {
          if(data3.access_groups?.utilisateurs)
            {
              console.log("autoriser...")
            }
            else
            {
              router.push(`/dashboard`);
            }
            
        
      }
        
      } catch (error) {
        console.error("Error fetching room details:", error)
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    fetchData()
  }, [])


  const handleInputChange = (e : ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
  };

  const handleImageDelete = () => {
    setUploadedImage(null);
    setClient({ ...client, img_url: "" });
  };




  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
  
    if (file) {
      // Étape 1: Lire le fichier pour l'afficher
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string); // Stocker l'URL de l'image téléchargée
      };
      reader.readAsDataURL(file);
  
      // Mettez à jour l'état avec le fichier d'origine
      setUploadedFile(file);
    }
  };
  




   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true)
    if (uploadedImage && uploadedFile) {
      const fileName = `${Date.now()}_${uploadedFile.name}`;
      let publicUrl;
      try{
        const data:any= await uploadFile(fileName,uploadedFile)
        if(data != null){
            publicUrl=data.publicUrl
          }
      }catch{
        console.error("Erreur lors de l'obtention de l'url");
        
      }
  

      client.img_url=publicUrl;
      client.id_client=uuidv4();
    }
  
    // Après avoir géré le téléchargement de l'image et mis à jour l'URL
    try {
    const response = await creerClient(client)

        // Réinitialiser le formulaire si nécessaire
        setClient({
          prenom: "",
          nom: "",
          Tel: "",
          Pays: "",
          ville: "",
          img_url: "",
          id_client:""
        });
        setUploadedImage(null);
        setUploadedFile(null);
        setIsDrawerOpen(false);
        setSelectedUser(null);
        setIsAddingClient(false);
        fetchData();
      setIsLoading(false)
      /*   toast.success(`Client ajouté avec succès: ${newClient.prenom}`);
        console.log(`Client ajouté avec succès: ${newClient.prenom}`);
  
      } else {
        console.error("Erreur lors de l'ajout du client");
        toast.error("Erreur lors de l'ajout du client");
      } */
    } catch (error) {
      console.error("Erreur lors de l'ajout du client:", error);
    }
  }; 
  

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsAddingClient(false);
    setIsDrawerOpen(true);
  };

  const handleAddClientClick = () => {
    setSelectedUser(null);
    setIsAddingClient(true);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
    setIsAddingClient(false);
  };

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
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">Clients</h2>
            <p className="text-muted-foreground">Liste des Clients</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              className="w-fit h-10 font-bold bg-red-600"
              onClick={handleAddClientClick}
            >
              <Plus /> Ajouter un Client
            </Button>
          </div>
        </div>

        {/* Tableau des données */}
        <DataTable 
        data={users}
        columns={columns}
        onRowClick={handleUserClick}
        currentPage={currentPage} 
        total={total} 
        setCurrentPage={setCurrentPage} 
      />

      
       
      </div>

      {/* Drawer pour afficher les informations de l'utilisateur ou le formulaire d'ajout */}
      <Drawer anchor='right' open={isDrawerOpen} onClose={closeDrawer}>
        <div className="p-4 w-[32vw]">
          {isAddingClient ? (
            // Formulaire d'ajout de client
            <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
              <h2 className="mb-8 text-2xl font-bold">Ajouter un Nouveau Client</h2>
              <form className="w-full" onSubmit={handleSubmit}>
              <div className="flex flex-col justify-center mb-4 items-center">
                  <label htmlFor="image" className="cursor-pointer flex flex-col items-center justify-center gap-1 relative">
                    <img
                      src={uploadedImage || 'https://i.pinimg.com/564x/11/d1/cf/11d1cf8094d0bf58d6bba80a0b2f5355.jpg'}
                      alt="Cliquez pour télécharger une image"
                      width={120}
                      height={120}
                      className=" h-44 w-44 opacity-60 hover:opacity-100 rounded-full object-cover"
                    />
                    <input
                      type="file"
                      id="image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <span className="text-sm flex items-center justify-center font-bold text-gray-700">
                    cliquez pour ajouter une photo
                    </span>
                  </label>
                  {uploadedImage && (
                    <Button
                      type="button"
                      onClick={handleImageDelete}
                      className=" h-10 text-sm text-white bg-red-600 font-bold "
                    >
                      Supprimer l'image
                    </Button>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Prénom</label>
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
                  <label className="block text-sm font-medium mb-2">Nom</label>
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
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
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
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Pays</label>
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
                  <label className="block text-sm font-medium mb-2">Ville</label>
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
                <div className="ml-auto pt-8 w-full items-center justify-center flex font-medium">
                  <Button type="submit"  className="w-fit h-10 font-bold">Ajouter le Client</Button>
                </div>
              </form>
              <ToastContainer />
            </div>
          ) : (
            // Affichage des informations de l'utilisateur
            selectedUser && (
              <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
                <h2 className="mb-8 text-2xl font-bold">
                  Client {selectedUser.prenom} {selectedUser.nom}
                </h2>
                <img
                  src={selectedUser.img_url}
                  alt="User Profile"
                  width={120}
                  height={120}
                  className="mb-10 h-52 w-52 rounded-full object-cover"
                />
                {/* <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">ID</div>
                  {selectedUser.id}
                </div> */}
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Téléphone</div>
                  {selectedUser.Tel}
                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Pays</div>
                  {selectedUser.Pays || '-'}
                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Ville</div>
                  {selectedUser.ville}
                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Commandes effectuées</div>
                  {selectedUser.total_commandes}
                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Date d'inscription</div>
                  <div>
                    {format(new Date(selectedUser.created_at), 'dd MMMM yyyy', { locale: fr })}
                    {` à ${format(new Date(selectedUser.created_at), 'HH:mm')}`}
                  </div>
                </div>
                {/* <div className="text-base grid grid-cols-2 p-3 items-center rounded-md shadow-sm w-full gap-full">
                          <div className="font-normal text-base">Actif</div>
                          {selectedUser.actif ? (<div className="bg-green-600 p-1 w-12 items-center justify-center flex text-white rounded-sm">Oui</div>) : (<div className="bg-red-600 p-1 w-12 items-center justify-center flex text-white rounded-sm">Non</div>)}
                </div> */}
                <div className="ml-auto pt-12 w-full items-center justify-center flex font-medium">
                <Button onClick={() => handleNavigation(selectedUser.id_client)} className="w-fit h-10 font-bold">Voir Détails</Button>   </div>

              </div>
            )
          )}
        </div>
      </Drawer>
    </>
  );
}

