"use client";

import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabaseClient';
import Drawer from '@mui/material/Drawer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus } from "lucide-react";
import React, { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { toast, ToastContainer } from 'react-toastify';
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
// Composant principal de la page des utilisateurs
export default function UserPage() {
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
  });

  async function fetchUsers(page = 1, pageSize = 10, search = '') {
    try {
      const response = await fetch(`/api/clients?page=${page}&pageSize=${pageSize}&search=${search}`);
      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total); // Total des utilisateurs pour la pagination
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    fetchUsers(currentPage);
}, [currentPage]);




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
  
    // Vérifiez si une image a été téléchargée
    if (uploadedImage && uploadedFile) {
      // Étape 2: Télécharger l'image dans Supabase
      const fileName = `${Date.now()}_${uploadedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('yabalma/images') // Assurez-vous que ce chemin est correct
        .upload(fileName, uploadedFile);
  
      if (uploadError) {
        console.error("Erreur lors du téléchargement de l'image :", uploadError.message);
        toast.error("Erreur lors du téléchargement de l'image");
        return;
      }
  
      // Étape 3: Obtenir l'URL publique de l'image
      const { data } = supabase.storage.from('yabalma/images').getPublicUrl(fileName); // Corrigez le chemin ici
      const publicUrl = data?.publicUrl;
  
      // Vérifiez si l'URL publique a été obtenue
      if (!publicUrl) {
        console.error("Erreur lors de l'obtention de l'URL publique");
        return;
      }
  
      // Étape 4: Mettre à jour l'état du client avec l'URL de l'image
      client.img_url=publicUrl;
    }
  
    // Après avoir géré le téléchargement de l'image et mis à jour l'URL
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(client),
      });
  
      if (response.ok) {
        const newClient = await response.json();
        console.log("Client ajouté avec succès:", newClient);
  
        // Réinitialiser le formulaire si nécessaire
        setClient({
          prenom: "",
          nom: "",
          Tel: "",
          Pays: "",
          ville: "",
          img_url: "",
        });
        setUploadedImage(null);
        setUploadedFile(null);
        setIsDrawerOpen(false);
        setSelectedUser(null);
        setIsAddingClient(false);
        fetchUsers(1, 10, '');
        toast.success(`Client ajouté avec succès: ${newClient.prenom}`);
        console.log(`Client ajouté avec succès: ${newClient.prenom}`);
  
      } else {
        console.error("Erreur lors de l'ajout du client");
        toast.error("Erreur lors de l'ajout du client");
      }
    } catch (error) {
      console.error("Erreur lors de la requête POST:", error);
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
        fetchUsers={fetchUsers} // Passer fetchUsers ici
        currentPage={currentPage} // Passer la page actuelle
        total={total} // Passer le total
        setCurrentPage={setCurrentPage} // Passer la fonction de mise à jour de la page
      />

      
       
      </div>

      {/* Drawer pour afficher les informations de l'utilisateur ou le formulaire d'ajout */}
      <Drawer anchor='right' open={isDrawerOpen} onClose={closeDrawer}>
        <div className="p-4 w-[30vw]">
          {isAddingClient ? (
            // Formulaire d'ajout de client
            <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
              <h2 className="mb-8 text-2xl font-bold">Ajouter un Nouveau Client</h2>
              <form className="w-full" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center">
                  <label htmlFor="image" className="cursor-pointer relative">
                    <img
                      src={uploadedImage || 'https://cdn-icons-png.flaticon.com/512/3616/3616929.png'}
                      alt="Cliquez pour télécharger une image"
                      width={120}
                      height={120}
                      className="mb-4 h-44 w-44 rounded-full object-cover"
                    />
                    <input
                      type="file"
                      id="image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
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
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">ID</div>
                  {selectedUser.id}
                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Téléphone</div>
                  {selectedUser.Tel}
                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Pays</div>
                  {selectedUser.Pays}
                </div>
                <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Ville</div>
                  {selectedUser.ville}
                </div>
                {/* <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-base">Commandes effectuées</div>
                  {selectedUser.commande}
                </div> */}
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
                  <Button className="w-fit h-10 font-bold">Voir Détails</Button>
                </div>
              </div>
            )
          )}
        </div>
      </Drawer>
    </>
  );
}

