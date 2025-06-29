"use client";

import {
  creerAnnonce,
  getallannonces,
  modifierAnnonce,
  supprimerAnnonce,
} from "@/app/api/annonces/query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/dialogConfirm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseSession } from "@/lib/authMnager";
import Drawer from "@mui/material/Drawer";
import { Book, Plus, Save, Trash2, X, Edit, MapPin, Calendar, Package, Truck, Grid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Annonce } from "../schema";
import { DataTable } from "./components/data-table";
import { createColumns } from "./components/columns";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function AnnonceGestionPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnonce, setSelectedAnnonce] = useState<Annonce | null>(null);
  const [selectedAnnonceId, setSelectedAnnonceId] = useState<any>(null);
  const [selectedAnnonceTitle, setSelectedAnnonceTitle] = useState<any>(null);
  const [isAddingAnnonce, setIsAddingAnnonce] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  let [color, setColor] = useState("#ffffff");
  const [annonce, setAnnonce] = useState<Annonce>({
    type_transport: "economy",
    poids_max: null,
    stock_annonce: null,
    id_client: "d04cda0e-0fa8-4fbc-bc3d-50e446e4ac79",
    statut: "Entrepot",
    is_boost: false,
    destination: "",
    source: "",
    devise_prix: "FCFA",
    lieu_depot: "",
    sourceAddress: "",
    destinationAddress: "",
    date_depart: "",
    date_arrive: "",
  });
  const router = useRouter();

  async function fetchData() {
    setIsLoading(true);
    try {
      const data: any = await getallannonces();
      if (data && data.length > 0) {
        setAnnonces(data);
        console.log(data);
      }

      const sessionData = getSupabaseSession();
      if (sessionData != null) {
        if (sessionData.access_groups?.annonces) {
          console.log("Accès autorisé...");
        } else {
          router.push(`/dashboard`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces :", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Force re-render des selects quand l'état change
  useEffect(() => {
    console.log("Annonce state changed:", annonce);
  }, [annonce]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAnnonce({ 
      ...annonce, 
      [name]: name === 'poids_max' || name === 'stock_annonce' 
        ? parseFloat(value) || null 
        : value 
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Changing ${name} from ${annonce[name as keyof typeof annonce]} to ${value}`);
    setAnnonce(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setAnnonce({ ...annonce, [name]: checked });
  };

  const deleteAnnonce = async (id_annonce: any) => {
    try {
      await supprimerAnnonce(id_annonce);
      console.log("Suppression réussie");
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'annonce:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(annonce);
      await creerAnnonce(annonce);

      setAnnonce({
        type_transport: "economy",
        poids_max: null,
        stock_annonce: null,
        id_client: "d04cda0e-0fa8-4fbc-bc3d-50e446e4ac79",
        statut: "Entrepot",
        is_boost: false,
        destination: "",
        source: "",
        devise_prix: "FCFA",
        lieu_depot: "",
        sourceAddress: "",
        destinationAddress: "",
        date_depart: "",
        date_arrive: "",
      });
      setIsDrawerOpen(false);
      setSelectedAnnonce(null);
      fetchData();
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'annonce:", error);
      setIsLoading(false);
    }
  };

  const handleAnnonceClick = (annonceItem: Annonce) => {
    setAnnonce(annonceItem);
    setIsAddingAnnonce(false);
    setIsDrawerOpen(true);
  };

  const handleAddAnnonceClick = () => {
    setAnnonce({
      type_transport: "economy",
      poids_max: null,
      stock_annonce: null,
      id_client: "d04cda0e-0fa8-4fbc-bc3d-50e446e4ac79",
      statut: "Entrepot",
      is_boost: false,
      destination: "",
      source: "",
      devise_prix: "FCFA",
      lieu_depot: "",
      sourceAddress: "",
      destinationAddress: "",
      date_depart: "",
      date_arrive: "",
    });
    setIsAddingAnnonce(true);
    setIsDrawerOpen(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(annonce);
      await modifierAnnonce(annonce.id_annonce, annonce);

      setAnnonce({
        type_transport: "economy",
        poids_max: null,
        stock_annonce: null,
        id_client: "d04cda0e-0fa8-4fbc-bc3d-50e446e4ac79",
        statut: "Entrepot",
        is_boost: false,
        destination: "",
        source: "",
        devise_prix: "FCFA",
        lieu_depot: "",
        sourceAddress: "",
        destinationAddress: "",
        date_depart: "",
        date_arrive: "",
      });
      setIsDrawerOpen(false);
      setSelectedAnnonce(null);
      fetchData();
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la modification de l'annonce:", error);
      setIsLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAnnonce(null);
  };

  const handleDeleteClick = (annonceItem: Annonce) => {
    setSelectedAnnonceId(annonceItem.id_annonce);
    setSelectedAnnonceTitle(`${annonceItem.source} → ${annonceItem.destination}`);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Entrepot': return 'bg-blue-100 text-blue-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <Drawer anchor="right" open={isDrawerOpen} onClose={closeDrawer}>
        <div className="p-4 flex items-center justify-center h-full w-[40vw] overflow-y-auto">
          {isAddingAnnonce ? (
            <div className="flex w-full max-w-2xl flex-col items-center border bg-white p-6 text-left">
              <h2 className="mb-6 text-2xl font-bold">
                Ajouter une Nouvelle Annonce
              </h2>
              <form className="w-full space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type_transport" className="block text-sm font-bold mb-2">
                      Type de Transport
                    </Label>
                    <select
                      id="type_transport"
                      name="type_transport"
                      value={annonce.type_transport}
                      onChange={(e) => handleSelectChange("type_transport", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="economy">Economy</option>
                      <option value="express">Express</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="devise_prix" className="block text-sm font-bold mb-2">
                      Devise
                    </Label>
                    <select
                      id="devise_prix"
                      name="devise_prix"
                      value={annonce.devise_prix}
                      onChange={(e) => handleSelectChange("devise_prix", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="FCFA">FCFA</option>
                      <option value="EUR">Euro</option>
                      <option value="USD">Dollar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source" className="block text-sm font-bold mb-2">
                      Source
                    </Label>
                    <Input
                      type="text"
                      id="source"
                      name="source"
                      value={annonce.source}
                      onChange={handleInputChange}
                      placeholder="Ville de départ"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination" className="block text-sm font-bold mb-2">
                      Destination
                    </Label>
                    <Input
                      type="text"
                      id="destination"
                      name="destination"
                      value={annonce.destination}
                      onChange={handleInputChange}
                      placeholder="Ville d'arrivée"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lieu_depot" className="block text-sm font-bold mb-2">
                    Lieu de Dépôt
                  </Label>
                  <Input
                    type="text"
                    id="lieu_depot"
                    name="lieu_depot"
                    value={annonce.lieu_depot}
                    onChange={handleInputChange}
                    placeholder="Adresse du lieu de dépôt"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="poids_max" className="block text-sm font-bold mb-2">
                      Prix du Transport
                    </Label>
                    <Input
                      type="number"
                      id="poids_max"
                      name="poids_max"
                      value={annonce.poids_max || ""}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock_annonce" className="block text-sm font-bold mb-2">
                      Poids Max (kg)
                    </Label>
                    <Input
                      type="number"
                      id="stock_annonce"
                      name="stock_annonce"
                      value={annonce.stock_annonce || ""}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_depart" className="block text-sm font-bold mb-2">
                      Date de Départ
                    </Label>
                    <Input
                      type="date"
                      id="date_depart"
                      name="date_depart"
                      value={annonce.date_depart}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_arrive" className="block text-sm font-bold mb-2">
                      Date d'Arrivée
                    </Label>
                    <Input
                      type="date"
                      id="date_arrive"
                      name="date_arrive"
                      value={annonce.date_arrive}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sourceAddress" className="block text-sm font-bold mb-2">
                      Adresse Source (optionnel)
                    </Label>
                    <Textarea
                      id="sourceAddress"
                      name="sourceAddress"
                      value={annonce.sourceAddress || ""}
                      onChange={handleInputChange}
                      placeholder="Adresse complète de départ"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="destinationAddress" className="block text-sm font-bold mb-2">
                      Adresse Destination (optionnel)
                    </Label>
                    <Textarea
                      id="destinationAddress"
                      name="destinationAddress"
                      value={annonce.destinationAddress || ""}
                      onChange={handleInputChange}
                      placeholder="Adresse complète d'arrivée"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="statut" className="block text-sm font-bold mb-2">
                      Statut
                    </Label>
                    <Select
                      value={annonce.statut}
                      onValueChange={(value) => handleSelectChange("statut", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrepot">Entrepôt</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="Terminé">Terminé</SelectItem>
                        <SelectItem value="Annulé">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_boost"
                        checked={annonce.is_boost}
                        onCheckedChange={(checked) => handleSwitchChange("is_boost", checked)}
                      />
                      <Label htmlFor="is_boost" className="text-sm font-medium">
                        Annonce boostée
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 w-full flex justify-center">
                  <Button type="submit" className="w-fit h-10 font-bold">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex w-full max-w-2xl flex-col items-center border bg-white p-6 text-left">
              <h2 className="mb-6 text-2xl font-bold">Modifier l'annonce</h2>
              <form onSubmit={handleSubmitEdit} className="w-full space-y-4">
                {/* Même formulaire que pour l'ajout, mais avec les valeurs pré-remplies */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type_transport-edit" className="block text-sm font-bold mb-2">
                      Type de Transport
                    </Label>
                    <select
                      id="type_transport-edit"
                      name="type_transport"
                      value={annonce.type_transport}
                      onChange={(e) => handleSelectChange("type_transport", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="economy">Economy</option>
                      <option value="express">Express</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="devise_prix-edit" className="block text-sm font-bold mb-2">
                      Devise
                    </Label>
                    <select
                      id="devise_prix-edit"
                      name="devise_prix"
                      value={annonce.devise_prix}
                      onChange={(e) => handleSelectChange("devise_prix", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="FCFA">FCFA</option>
                      <option value="EUR">Euro</option>
                      <option value="USD">Dollar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source-edit" className="block text-sm font-bold mb-2">
                      Source
                    </Label>
                    <Input
                      type="text"
                      id="source-edit"
                      name="source"
                      value={annonce.source}
                      onChange={handleInputChange}
                      placeholder="Ville de départ"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination-edit" className="block text-sm font-bold mb-2">
                      Destination
                    </Label>
                    <Input
                      type="text"
                      id="destination-edit"
                      name="destination"
                      value={annonce.destination}
                      onChange={handleInputChange}
                      placeholder="Ville d'arrivée"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lieu_depot-edit" className="block text-sm font-bold mb-2">
                    Lieu de Dépôt
                  </Label>
                  <Input
                    type="text"
                    id="lieu_depot-edit"
                    name="lieu_depot"
                    value={annonce.lieu_depot}
                    onChange={handleInputChange}
                    placeholder="Adresse du lieu de dépôt"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="poids_max-edit" className="block text-sm font-bold mb-2">
                      Prix du Transport
                    </Label>
                    <Input
                      type="number"
                      id="poids_max-edit"
                      name="poids_max"
                      value={annonce.poids_max || ""}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock_annonce-edit" className="block text-sm font-bold mb-2">
                      Poids Max (kg)
                    </Label>
                    <Input
                      type="number"
                      id="stock_annonce-edit"
                      name="stock_annonce"
                      value={annonce.stock_annonce || ""}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_depart-edit" className="block text-sm font-bold mb-2">
                      Date de Départ
                    </Label>
                    <Input
                      type="date"
                      id="date_depart-edit"
                      name="date_depart"
                      value={annonce.date_depart}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_arrive-edit" className="block text-sm font-bold mb-2">
                      Date d'Arrivée
                    </Label>
                    <Input
                      type="date"
                      id="date_arrive-edit"
                      name="date_arrive"
                      value={annonce.date_arrive}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="statut-edit" className="block text-sm font-bold mb-2">
                      Statut
                    </Label>
                    <Select
                      value={annonce.statut}
                      onValueChange={(value) => handleSelectChange("statut", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrepot">Entrepôt</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="Terminé">Terminé</SelectItem>
                        <SelectItem value="Annulé">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_boost-edit"
                        checked={annonce.is_boost}
                        onCheckedChange={(checked) => handleSwitchChange("is_boost", checked)}
                      />
                      <Label htmlFor="is_boost-edit" className="text-sm font-medium">
                        Annonce boostée
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 w-full flex justify-center space-x-4">
                  <Button type="submit" className="font-bold gap-2">
                    <Save />
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    onClick={closeDrawer}
                    variant="outline"
                    className="font-bold">
                    <X />
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Drawer>

      <div className="hidden flex-col max-h-[90vh] overflow-y-auto md:flex">
        <div className="border-b"></div>
        <div className="flex-1 md:space-y-4 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-4xl flex items-center justify-center gap-2 font-bold tracking-tight">
              <Book /> Gestion des Annonces
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Cartes
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4 mr-2" />
                  Tableau
                </Button>
              </div>
              <Button
                type="button"
                className="w-fit h-fit font-bold bg-red-600"
                onClick={handleAddAnnonceClick}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter une Annonce
              </Button>
            </div>
          </div>

          <ConfirmDialog
            isOpen={isDialogOpen}
            message={`Êtes-vous sûr de vouloir supprimer l'annonce : ${selectedAnnonceTitle} ?`}
            onConfirm={() => {
              if (selectedAnnonceId !== null) {
                deleteAnnonce(selectedAnnonceId);
                setSelectedAnnonceId(null);
                setSelectedAnnonceTitle(null);
              }
              setDialogOpen(false);
            }}
            onCancel={() => {
              setDialogOpen(false);
              setSelectedAnnonceId(null);
              setSelectedAnnonceTitle(null);
            }}
          />

          {viewMode === 'table' ? (
            <DataTable 
              columns={createColumns({ 
                onEdit: handleAnnonceClick, 
                onDelete: handleDeleteClick 
              })} 
              data={annonces} 
            />
          ) : (
            <div className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
              {annonces.map((annonceItem) => (
              <Card key={annonceItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className={`h-5 w-5 ${annonceItem.type_transport === 'express' ? 'text-red-600' : 'text-blue-600'}`} />
                      <span className="text-sm font-medium">
                        {annonceItem.type_transport === 'express' ? 'Express' : 'Economy'}
                      </span>
                    </div>
                    {annonceItem.is_boost && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Boostée
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {annonceItem.source} → {annonceItem.destination}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {annonceItem.stock_annonce ? `${annonceItem.stock_annonce}kg max` : 'Poids non spécifié'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Prix transport: {annonceItem.poids_max ? `${annonceItem.poids_max} ${annonceItem.devise_prix}` : 'Non spécifié'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {formatDate(annonceItem.date_depart)} → {formatDate(annonceItem.date_arrive)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {annonceItem.poids_max ? `${annonceItem.poids_max} ${annonceItem.devise_prix}` : 'Prix non spécifié'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(annonceItem.statut)}`}>
                      {annonceItem.statut}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Dépôt: {annonceItem.lieu_depot}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    ID: {annonceItem.id_annonce}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="w-full grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleDeleteClick(annonceItem)}
                      variant="destructive"
                      size="sm"
                      className="font-bold gap-1">
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                    <Button
                      onClick={() => handleAnnonceClick(annonceItem)}
                      size="sm"
                      className="font-bold gap-1">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                  </div>
                </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {annonces.length === 0 && (
            <div className="text-center py-12">
              <Book className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune annonce</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter une nouvelle annonce.
              </p>
              <div className="mt-6">
                <Button
                  type="button"
                  className="font-bold bg-red-600"
                  onClick={handleAddAnnonceClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une Annonce
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 