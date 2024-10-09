'use client'
import { Button } from "@/components/ui/button";
import Drawer from '@mui/material/Drawer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus } from "lucide-react";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { toast, ToastContainer } from 'react-toastify';
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getallgp } from "@/app/api/gp/route";
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
  const [isAddingGp, setIsAddingGp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [Gp, setGp] = useState({
    prenom: "",
    nom: "",
    Tel: "",
    Pays: "",
    ville: "",
    img_url: "",
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getallgp()
        if (data && data.length > 0) {
          setUsers(data)
         
        }
      } catch (error) {
        console.error("Error fetching room details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])
  

 /* async function fetchUsers(page = 1, pageSize = 10, search = '') {
    try {
      const response = await fetch(`/api/gp?page=${page}&pageSize=${pageSize}&search=${search}`);
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
*/

const handleInputChange = (e : ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setGp({ ...Gp, [name]: value });
};

const handleImageDelete = () => {
  setUploadedImage(null);
  setGp({ ...Gp, img_url: "" });
};


/*const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    Gp.img_url=publicUrl;
  }

  // Après avoir géré le téléchargement de l'image et mis à jour l'URL
  try {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Gp),
    });

    if (response.ok) {
      const newClient = await response.json();
      console.log("Client ajouté avec succès:", newClient);

      // Réinitialiser le formulaire si nécessaire
      setGp({
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
      setIsAddingGp(false);
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
};*/

const handleSubmit=async()=>{
console.log("j envoie")
}
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


const handleUserClick = (user: any) => {
  setSelectedUser(user);
  setIsAddingGp(false);
  setIsDrawerOpen(true);
};

const handleAddGpClick = () => {
  setSelectedUser(null);
  setIsAddingGp(true);
  setIsDrawerOpen(true);
};

const closeDrawer = () => {
  setIsDrawerOpen(false);
  setSelectedUser(null);
  setIsAddingGp(false);
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
            <h2 className="text-4xl font-extrabold tracking-tight">GP</h2>
            <p className="text-muted-foreground">Liste des GP</p>
          </div>
          <div className="flex items-center space-x-2">
          <Button
              type="button"
              className="w-fit h-10 font-bold bg-red-600"
              onClick={handleAddGpClick}
            >
              <Plus /> Ajouter un GP
            </Button>
          </div>
        </div>
        
        {/* Tableau des données */}
        <DataTable 
        data={users}
        columns={columns}
        onRowClick={handleUserClick}
        // Passer fetchUsers ici
        currentPage={currentPage} // Passer la page actuelle
        total={total} // Passer le total
        setCurrentPage={setCurrentPage} // Passer la fonction de mise à jour de la page
      />
      </div>
      <Drawer anchor='right' open={isDrawerOpen} onClose={closeDrawer}>
        <div className="p-4 w-[30vw]">
          {isAddingGp ? (
            // Formulaire d'ajout de Gp
            <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
              <h2 className="mb-8 text-2xl font-bold">Ajouter un Nouveau GP</h2>
              <form className="w-full" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center">
                  <label htmlFor="image" className="cursor-pointer relative">
                    <img
                      src={uploadedImage || 'https://i.pinimg.com/564x/11/d1/cf/11d1cf8094d0bf58d6bba80a0b2f5355.jpg'}
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
                      value={Gp.prenom}
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
                    value={Gp.nom}
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
                    value={Gp.Tel}
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
                    value={Gp.Pays}
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
                    value={Gp.ville}
                    onChange={handleInputChange}
                    placeholder="Ville"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div className="ml-auto pt-8 w-full items-center justify-center flex font-medium">
                  <Button type="submit"  className="w-fit h-10 font-bold">Ajouter le GP</Button>
                </div>
              </form>
              <ToastContainer />
            </div>
          ) : (
            // Affichage des informations de l'utilisateur
            selectedUser && (
              <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
                <h2 className="mb-8 text-2xl font-bold">GP {selectedUser.prenom} {selectedUser.nom}</h2>
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
                  </div>
                 {/*  <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full  gap-full">
                    <div className="font-normal text-base">Livraisons effectuees</div>
                    {selectedUser.delivery}
                  </div> */}
                  <div className="text-base grid grid-cols-2 font-bold p-4 rounded-md shadow-sm w-full  gap-full">
                    <div className="font-normal text-base">Date d'inscription</div>
                    <div>
                      {format(new Date(selectedUser.created_at), 'dd MMMM yyyy', { locale: fr })}
                      {` à ${format(new Date(selectedUser.created_at), 'HH:mm')}`}
                      </div>
                      </div>
                    {/*   <div className="text-base grid grid-cols-2 p-3 items-center rounded-md shadow-sm w-full gap-full">
                          <div className="font-normal text-base">Actif</div>
                          {selectedUser.actif ? (<div className="bg-green-600 p-1 w-12 items-center justify-center flex text-white rounded-sm">Oui</div>) : (<div className="bg-red-600 p-1 w-12 items-center justify-center flex text-white rounded-sm">Non</div>)}
                      </div> */}
                      <div className="ml-auto pt-12 w-full items-center justify-center flex font-medium">
                      <Button className="w-fit h-10 font-bold">Voir Details</Button>
                    </div>
              </div>
            )
          )}
        </div>
      </Drawer>
    </>
  );
}
