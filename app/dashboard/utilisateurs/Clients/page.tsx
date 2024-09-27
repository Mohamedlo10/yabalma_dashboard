"use client";

import { Button } from "@/components/ui/button";
import Drawer from '@mui/material/Drawer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus } from "lucide-react";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
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
  const [selectedUser,setSelectedUser] =useState<any| null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  let [color, setColor] = useState("#ffffff");


  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/clients");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleUserClick = (user: any) => {
    setSelectedUserId(user.id);
    setSelectedUser(user) // Assurez-vous que 'id' est le bon champ de l'utilisateur
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUserId(null);
  };

  if (isLoading) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
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
            <Button type="button" className="w-fit h-10 font-bold bg-red-600">
              <Plus /> Ajouter un Client
            </Button>
          </div>
        </div>
        
        {/* Tableau des données */}
        <DataTable
          data={users}
          columns={columns}
          onRowClick={handleUserClick} // Pass the handleUserClick function to the DataTable
        />
      </div>

      {/* Drawer pour afficher les informations de l'utilisateur */}
      {isDrawerOpen && (
        <Drawer anchor='right'  open={isDrawerOpen} onClose={closeDrawer}>
          <div className="p-4 w-[30vw]">
            <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
                  <h2 className="mb-8 text-2xl font-bold">Client {selectedUser.prenom} {selectedUser.nom}</h2>
                  <img
                    src={selectedUser.img_url}
                    alt="User Profile"
                    width={120}
                    height={120}
                    className="mb-10 h-52 w-52 rounded-full object-cover"
                  />
                  <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full  gap-full">
                    <div className="font-normal text-base">ID</div>
                    {selectedUser.id}
                  </div>
                  <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full  gap-full">
                    <div className="font-normal text-base">Telephone</div>
                    {selectedUser.Tel}
                  </div><div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full  gap-full">
                    <div className="font-normal text-base">Pays</div>
                    {selectedUser.Pays}
                  </div><div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full  gap-full">
                    <div className="font-normal text-base">Ville</div>
                    {selectedUser.ville}
                  </div><div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full  gap-full">
                    <div className="font-normal text-base">Commandes effectuees</div>
                    {selectedUser.commande}
                  </div>
                  <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full  gap-full">
                    <div className="font-normal text-base">Date d'inscription</div>
                    <div>
                      {format(new Date(selectedUser.created_at), 'dd MMMM yyyy', { locale: fr })}
                      {` à ${format(new Date(selectedUser.created_at), 'HH:mm')}`} {/* Ajout de l'heure */}
                    </div>
                  </div>
                  <div className="ml-auto pt-12 w-full items-center justify-center flex font-medium">
                  <Button className="w-fit h-10 font-bold">Voir Details</Button>
                </div>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
