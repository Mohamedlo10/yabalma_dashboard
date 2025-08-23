"use client";

import { Button } from "@/components/ui/button";

import Drawer from "@mui/material/Drawer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { getAllRole } from "@/app/api/settings/query";
import { getAllUsersAdmin, signUpCompte } from "@/app/api/superAdmin/query";
import { getSupabaseSession } from "@/lib/authMnager";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import Icon from "react-icons-kit";
import { eye } from "react-icons-kit/feather/eye";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import BeatLoader from "react-spinners/BeatLoader";
import { ToastContainer } from "react-toastify";
import { Admin } from "../profile/schema";
import { Role } from "../settings/schema";
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
  const [user, setUser] = useState<Admin>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  let [color, setColor] = useState("#ffffff");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [Compte, setCompte] = useState({
    email: "",
    password: "",
    poste: "",
    prenom: "",
    nom: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [icon, setIcon] = useState(eyeOff);
  const [type, setType] = useState("password");
  const router = useRouter();

  const handleNavigation = (idCompte: string) => {
    router.push(`/dashboard/accounts/profile?id=${idCompte}`);
  };

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };

  async function fetchData() {
    setIsLoading(true);
    try {
      const data: any = await getAllUsersAdmin();
      if (data && data.length > 0) {
        setUsers(data);
        console.log(data);
        setTotal(data.length);
      }
      const data2: any = await getAllRole();
      if (data2 && data2.length > 0) {
        console.log(data2);
        setRoles(data2);
      }

      const data3 = getSupabaseSession();
      if (data3 != null) {
        if (data3.access_groups?.accounts) {
          console.log("autoriser...");
        } else {
          router.push(`/dashboard`);
        }
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompte({ ...Compte, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const myposte = roles.find((role) => role.nom === Compte.poste);
    try {
      console.log(myposte);
      console.log(Compte);
      const response = await signUpCompte(Compte, myposte);

      setCompte({
        email: "",
        password: "",
        poste: "",
        prenom: "",
        nom: "",
      });
      setUploadedImage(null);
      setUploadedFile(null);
      setIsDrawerOpen(false);
      setSelectedUser(null);
      setIsAddingClient(false);
      fetchData();
      setIsLoading(false);
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
  const handleRoleChange = (selectedRole: string) => {
    setCompte((prevCompte) => ({
      ...prevCompte,
      poste: selectedRole, // Met à jour avec le rôle sélectionné
    }));
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
            <h2 className="text-4xl font-extrabold tracking-tight">Comptes</h2>
            <p className="text-muted-foreground">Liste des comptes</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              className="w-fit h-10 font-bold bg-red-600"
              onClick={handleAddClientClick}
            >
              <Plus /> Ajouter un Compte
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
      <Drawer
        anchor="right"
        className=""
        open={isDrawerOpen}
        onClose={closeDrawer}
      >
        <div className="p-4  w-[37vw] items-center h-full justify-center flex">
          {isAddingClient ? (
            // Formulaire d'ajout de client
            <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
              <h2 className="mb-8 text-xl font-bold">
                Ajouter un Nouveau Compte
              </h2>
              <form className="w-full" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Prenom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={Compte.prenom}
                    onChange={handleInputChange}
                    placeholder="Prenom"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={Compte.nom}
                    onChange={handleInputChange}
                    placeholder="Nom"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Mail</label>
                  <input
                    type="text"
                    name="email"
                    value={Compte.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Mot de passe
                  </label>
                  <input
                    type={type}
                    name="password"
                    value={Compte.password}
                    onChange={handleInputChange}
                    placeholder="Mot de passe"
                    className="border p-2 rounded w-full"
                    required
                  />
                  <span
                    className="flex justify-end items-end"
                    onClick={handleToggle}
                  >
                    <Icon
                      className="absolute mr-4 text-zinc-500 hover:bg-slate-200 p-2 rounded-full "
                      icon={icon}
                      size={24}
                    />
                  </span>
                </div>

                <div className="h-full">
                  <div className="space-y-2">
                    <h3 className="font-bold">Role</h3>
                    {roles.map((role, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`radio-${role}`}
                          name="user-role"
                          value={role.nom}
                          checked={Compte?.poste === role.nom}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          className="radio-input"
                        />
                        <label
                          htmlFor={`radio-${role}`}
                          className="text-sm font-medium"
                        >
                          {role.nom}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ml-auto pt-8 w-full items-center justify-center flex font-medium">
                  <Button type="submit" className="w-fit h-10 font-bold">
                    Ajouter le Compte
                  </Button>
                </div>
              </form>
              <ToastContainer />
            </div>
          ) : (
            // Affichage des informations de l'utilisateur
            selectedUser && (
              <div className="flex w-full max-w-xl flex-col items-center border bg-white p-2 text-left">
                <h2 className="mb-8 text-base font-bold">
                  Compte : {selectedUser.phone || selectedUser.email}
                </h2>
                <div className="text-sm grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-sm">Prenom et Nom</div>
                  {selectedUser.user_metadata?.prenom}{" "}
                  {selectedUser.user_metadata?.nom}
                </div>
                <div className="text-sm grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-sm">Role</div>
                  {selectedUser.user_metadata?.poste?.nom}
                </div>

                {selectedUser.last_sign_in_at ? (
                  <div className="text-sm grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                    <div className="font-normal text-sm">
                      Derniere connexion
                    </div>
                    <div>
                      {format(
                        new Date(selectedUser.last_sign_in_at),
                        "dd MMMM yyyy",
                        { locale: fr }
                      )}
                      {` à ${format(
                        new Date(selectedUser.last_sign_in_at),
                        "HH:mm"
                      )}`}
                    </div>
                  </div>
                ) : (
                  <div></div>
                )}

                <div className="text-sm grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-sm">Date d'inscription</div>
                  <div>
                    {format(new Date(selectedUser.created_at), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                    {` à ${format(new Date(selectedUser.created_at), "HH:mm")}`}
                  </div>
                </div>

                <div className="ml-auto pt-12 w-full items-center justify-center flex font-medium">
                  <Button
                    onClick={() => handleNavigation(selectedUser.id)}
                    className="w-fit h-10 font-bold"
                  >
                    Voir Détails
                  </Button>{" "}
                </div>
              </div>
            )
          )}
        </div>
      </Drawer>
    </>
  );
}
