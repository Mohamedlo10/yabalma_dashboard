"use client";

import {
  creerAnnonce,
  getallannonces,
  modifierAnnonce,
  supprimerAnnonce,
} from "@/app/api/annonces/query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/dialogConfirm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseSession } from "@/lib/authMnager";
import { DEFAULT_SENDER_ID } from "@/lib/constants";
import Drawer from "@mui/material/Drawer";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Plane,
  Grid,
  List,
  Book,
  Calendar,
  MapPin,
  Package,
  Truck,
  ShoppingCart,
  Filter,
  CheckIcon,
  Info,
  AlertTriangle,
  Play,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Annonce } from "./schema";
import { DataTable } from "./components/data-table";
import { createColumns } from "./components/columns";
import { getCommandesByIdAnnonce } from "@/app/api/commandes/query";
import { registerWarehouseInfo } from "@/app/api/commandes/query";
import { Badge } from "@/components/ui/badge";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function AnnonceGestionPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [filteredAnnonces, setFilteredAnnonces] = useState<Annonce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnonce, setSelectedAnnonce] = useState<Annonce | null>(null);
  const [selectedAnnonceId, setSelectedAnnonceId] = useState<any>(null);
  const [selectedAnnonceTitle, setSelectedAnnonceTitle] = useState<any>(null);
  const [isAddingAnnonce, setIsAddingAnnonce] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isCommandesDrawerOpen, setIsCommandesDrawerOpen] = useState(false);
  const [annonceCommandes, setAnnonceCommandes] = useState<any[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isLoadingCommandes, setIsLoadingCommandes] = useState(false);
  let [color, setColor] = useState("#ffffff");
  
  // États pour la préparation en entrepôt
  const [openWarehouseDialog, setOpenWarehouseDialog] = useState(false);
  const [openWarehouseViewDialog, setOpenWarehouseViewDialog] = useState(false);
  const [warehousePrice, setWarehousePrice] = useState("");
  const [warehouseWeight, setWarehouseWeight] = useState("");
  const [warehouseTransportType, setWarehouseTransportType] = useState("");
  const [warehousePhotos, setWarehousePhotos] = useState<File[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseError, setWarehouseError] = useState("");
  const [selectedCommandeForWarehouse, setSelectedCommandeForWarehouse] = useState<any>(null);
  const [annonce, setAnnonce] = useState<Annonce>({
    type_transport: "economy",
    poids_max: null,
    stock_annonce: null,
    id_client: DEFAULT_SENDER_ID,
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

  // Protection contre les erreurs de rendu
  const [renderError, setRenderError] = useState<string | null>(null);

  // Gestionnaire d'erreur global - Version simplifiée
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('🚨 Erreur globale détectée:', error);
      // Ne pas mettre à jour l'état pour éviter les boucles
      // setRenderError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Si il y a une erreur de rendu, afficher un message d'erreur
  if (renderError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            Erreur de l'application
          </h1>
          <p className="text-red-600 mb-6">
            Une erreur s'est produite lors du rendu de l'application.
          </p>
          <p className="text-sm text-red-500 mb-6 font-mono bg-red-100 p-3 rounded">
            {renderError}
          </p>
          <Button
            onClick={() => {
              setRenderError(null);
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Recharger l'application
          </Button>
        </div>
      </div>
    );
  }



  async function fetchData() {
    setIsLoading(true);
    try {
      const data: any = await getallannonces();
      if (data && data.length > 0) {
        setAnnonces(data);
        setFilteredAnnonces(data); // Initialiser les annonces filtrées
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

  // Fonction de filtrage par statut
  const handleStatusFilter = (statut: string) => {
    if (activeStatusFilter === statut) {
      setActiveStatusFilter(null);
      setFilteredAnnonces(annonces);
    } else {
      setActiveStatusFilter(statut);
      const filtered = annonces.filter(annonce => annonce.statut === statut);
      setFilteredAnnonces(filtered);
    }
  };

  // Fonction de réinitialisation des filtres
  const clearFilters = () => {
    setActiveStatusFilter(null);
    setFilteredAnnonces(annonces);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Entrepot":
        return "bg-blue-100 text-blue-800";
      case "En cours":
        return "bg-yellow-100 text-yellow-800";
      case "Terminé":
        return "bg-green-100 text-green-800";
      case "Annulé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAnnonce({
      ...annonce,
      [name]:
        name === "poids_max" || name === "stock_annonce"
          ? parseFloat(value) || null
          : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(
      `Changing ${name} from ${
        annonce[name as keyof typeof annonce]
      } to ${value}`
    );
    setAnnonce((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setAnnonce({ ...annonce, [name]: checked });
  };

  const deleteAnnonce = async (id_annonce: any) => {
    try {
      await supprimerAnnonce(id_annonce);
      console.log("Suppression réussie");
      showNotification('success', 'Annonce supprimée avec succès');
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'annonce:", error);
      showNotification('error', 'Erreur lors de la suppression de l\'annonce');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation des dates
    if (!validateDates(annonce.date_depart, annonce.date_arrive)) {
      showNotification('error', 'La date d\'arrivée doit être après la date de départ');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(annonce);
      await creerAnnonce(annonce);

      setAnnonce({
        type_transport: "economy",
        poids_max: null,
        stock_annonce: null,
        id_client: DEFAULT_SENDER_ID,
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
      showNotification('success', 'Annonce créée avec succès');
      fetchData();
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'annonce:", error);
      showNotification('error', 'Erreur lors de la création de l\'annonce');
      setIsLoading(false);
    }
  };

  const handleAnnonceClick = (annonceItem: Annonce) => {
    setAnnonce(annonceItem);
    setIsAddingAnnonce(false);
    setIsDrawerOpen(true);
  };

  const handleOpenCommandes = async (annonce: Annonce) => {
    try {
      // Vider les anciennes commandes avant de charger les nouvelles
      setAnnonceCommandes([]);
      setIsLoadingCommandes(true);
      
      // Récupérer les commandes de l'annonce
      setIsCommandesDrawerOpen(true);
      setAnnonce(annonce);
      
      const data = await getCommandesByIdAnnonce(annonce.id_annonce);
      if (data && data.length > 0) {
        setAnnonceCommandes(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
      showNotification('error', 'Erreur lors de la récupération des commandes');
    } finally {
      setIsLoadingCommandes(false);
    }
  };

  const handleCloseCommandes = () => {
    setIsCommandesDrawerOpen(false);
    setAnnonceCommandes([]); // Vider les commandes
    setAnnonce({} as Annonce); // Réinitialiser l'annonce sélectionnée
  };

  // Fonction pour formater le prix avec validation - Version simplifiée
  const formatPrice = (value: string) => {
    // Permettre toute saisie, juste nettoyer les espaces et virgules
    return value.replace(/\s/g, '').replace(',', '.');
  };

  // Fonction pour formater le poids avec validation - Version simplifiée
  const formatWeight = (value: string) => {
    // Permettre toute saisie, juste nettoyer les espaces et virgules
    return value.replace(/\s/g, '').replace(',', '.');
  };

  // Fonction pour la préparation en entrepôt - Version améliorée
  const handleWarehouseSubmit = async () => {
    try {
      console.log('🚀 Début de la préparation en entrepôt');
      
      // Vérifications de sécurité
      if (!selectedCommandeForWarehouse) {
        setWarehouseError("Aucune commande sélectionnée");
        return;
      }
      
      if (!warehousePrice || !warehouseWeight) {
        setWarehouseError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      
      // Validation des valeurs numériques
      const price = parseFloat(warehousePrice.replace(/\s/g, '').replace(',', '.'));
      const weight = parseFloat(warehouseWeight.replace(/\s/g, '').replace(',', '.'));
      
      if (isNaN(price) || price <= 0) {
        setWarehouseError("Le prix doit être un nombre positif (ex: 1500.50)");
        return;
      }
      
      if (isNaN(weight) || weight <= 0) {
        setWarehouseError("Le poids doit être un nombre positif (ex: 2.5)");
        return;
      }
      
      // Validation des décimales (max 2 décimales) - plus flexible
      const priceStr = warehousePrice.replace(/\s/g, '').replace(',', '.');
      const weightStr = warehouseWeight.replace(/\s/g, '').replace(',', '.');
      
      if (priceStr.includes('.') && priceStr.split('.')[1]?.length > 2) {
        setWarehouseError("Le prix ne peut avoir que 2 décimales maximum");
        return;
      }
      
      if (weightStr.includes('.') && weightStr.split('.')[1]?.length > 2) {
        setWarehouseError("Le poids ne peut avoir que 2 décimales maximum");
        return;
      }
      
      // Validation du type de transport
      if (!warehouseTransportType) {
        setWarehouseTransportType('economy'); // Valeur par défaut
      }
      
      setWarehouseLoading(true);
      setWarehouseError("");
      
      console.log('✅ Validation OK, appel API...');
      console.log('📦 Données à envoyer:', {
        commandeId: selectedCommandeForWarehouse.id,
        price,
        weight,
        transportType: warehouseTransportType,
        photosCount: warehousePhotos.length
      });
      
      // Appel API
      const result = await registerWarehouseInfo(
        selectedCommandeForWarehouse.id,
        warehousePhotos,
        {
          price: price,
          weight: weight,
          transport_type: warehouseTransportType,
        }
      );
      
      console.log('📡 Résultat API:', result);
      
      if (result.error) {
        setWarehouseError(result.error);
        showNotification('error', `Erreur: ${result.error}`);
      } else {
        // Mettre à jour l'état local des commandes
        setAnnonceCommandes((prev) =>
          prev.map((commande) =>
            commande.id === selectedCommandeForWarehouse.id
              ? { 
                  ...commande, 
                  warehouse_info: {
                    price: price,
                    weight: weight,
                    transport_type: warehouseTransportType,
                  }, 
                  statut: "Entrepot" 
                }
              : commande
          )
        );
        
        // Fermer le dialog et réinitialiser
        setOpenWarehouseDialog(false);
        setWarehousePrice("");
        setWarehouseWeight("");
        setWarehouseTransportType("");
        setWarehousePhotos([]);
        setSelectedCommandeForWarehouse(null);
        
        // Notification de succès
        const isModification = selectedCommandeForWarehouse.warehouse_info;
        showNotification('success', isModification 
          ? 'Informations du warehouse modifiées avec succès' 
          : 'Commande préparée en entrepôt avec succès'
        );
        
        // Rafraîchir les données si nécessaire
        // await fetchData();
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la préparation en entrepôt:', err);
      const errorMessage = err?.message || err?.toString() || "Erreur inconnue";
      setWarehouseError(errorMessage);
      showNotification('error', `Erreur lors de la préparation en entrepôt: ${errorMessage}`);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleVoirDetailCommande = (commande: any) => {
    console.log('Détails de la commande:', commande);
    // Ici vous pouvez ajouter la logique pour afficher les détails
    // Par exemple, ouvrir un autre drawer ou naviguer vers une page
    showNotification('info', `Affichage des détails de la commande #${commande.id_commande || commande.numero_commande}`);
  };

  const handleUpdateAnnonceStatus = async (newStatut: string) => {
    try {
      // Vérifier que l'annonce a un ID valide
      if (!annonce || !annonce.id_annonce) {
        showNotification('error', 'Annonce invalide pour la mise à jour du statut');
        return;
      }
      
      setIsLoading(true);
      const { client, ...annonceSansClient } = annonce;
      await modifierAnnonce(annonce.id_annonce, { ...annonceSansClient, statut: newStatut });
      
      // Mettre à jour l'état local
      setAnnonce(prev => ({ ...prev, statut: newStatut }));
      
      // Rafraîchir les données
      await fetchData();
      
      showNotification('success', `Statut du trajet mis à jour vers: ${newStatut}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showNotification('error', 'Erreur lors de la mise à jour du statut');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnnonceClick = () => {
    setAnnonce({
      type_transport: "economy",
      poids_max: null,
      stock_annonce: null,
      id_client: DEFAULT_SENDER_ID,
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
    
    // Validation des dates
    if (!validateDates(annonce.date_depart, annonce.date_arrive)) {
      showNotification('error', 'La date d\'arrivée doit être après la date de départ');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(annonce);
      const { client, ...annonceSansClient } = annonce;
      await modifierAnnonce(annonce.id_annonce, { ...annonceSansClient });

      setAnnonce({
        type_transport: "economy",
        poids_max: null,
        stock_annonce: null,
        id_client: DEFAULT_SENDER_ID,
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
      showNotification('success', 'Annonce modifiée avec succès');
      fetchData();
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la modification de l'annonce:", error);
      showNotification('error', 'Erreur lors de la modification de l\'annonce');
      setIsLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAnnonce(null);
  };

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: '' });
    }, 3000);
  };

  const validateDates = (dateDepart: string, dateArrive: string): boolean => {
    if (!dateDepart || !dateArrive) return true; // Permettre les champs vides
    const depart = new Date(dateDepart);
    const arrive = new Date(dateArrive);
    return depart <= arrive;
  };

  const handleDeleteClick = (annonceItem: Annonce) => {
    setSelectedAnnonceId(annonceItem.id_annonce);
    setSelectedAnnonceTitle(
      `${annonceItem.source} → ${annonceItem.destination}`
    );
    setDialogOpen(true);
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

  // Composant de test minimal pour l'instant
  return (
    <>
      {/* Notification toast */}
      {notification.type && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : notification.type === 'error'
            ? 'bg-red-500 text-white'
            : notification.type === 'warning'
            ? 'bg-orange-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckIcon className="h-5 w-5" />
            ) : notification.type === 'error' ? (
              <X className="h-5 w-5" />
            ) : notification.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="hidden flex-col max-h-[90vh] overflow-y-auto md:flex">
        <div className="border-b"></div>
        <div className="flex-1 md:space-y-4 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-4xl flex items-center justify-center gap-2 font-bold tracking-tight">
              <Plane /> Gestion des Trajets
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Cartes
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4 mr-2" />
                  Tableau
                </Button>
              </div>
              <Button
                type="button"
                className="w-fit h-fit font-bold bg-red-600"
                onClick={handleAddAnnonceClick}
              >
                <Plus className="mr-2 h-4 w-4" /> Ajouter un trajet
              </Button>
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          {activeStatusFilter && viewMode === "cards" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Filtrage actif par statut
                    </h3>
                    <p className="text-sm text-blue-700">
                      Affichage des trajets avec le statut : 
                      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                        {activeStatusFilter}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredAnnonces.length}
                    </div>
                    <div className="text-sm text-blue-600">
                      trajet{filteredAnnonces.length > 1 ? 's' : ''} trouvé{filteredAnnonces.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Cross2Icon className="h-4 w-4 mr-1" />
                    Effacer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {viewMode === "table" ? (
            <DataTable
              columns={createColumns({
                onEdit: handleAnnonceClick,
                onDelete: handleDeleteClick,
              })}
              data={annonces}
            />
          ) : (
            <>
              {/* Filtres rapides pour la vue cartes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Filtres rapides</h3>
                  <div className="flex items-center gap-2">
                    {activeStatusFilter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs"
                      >
                        <Cross2Icon className="h-4 w-4 mr-1" />
                        Effacer les filtres
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {['Entrepot', 'En cours', 'Terminé', 'Annulé'].map((statut) => (
                    <Button
                      key={statut}
                      variant={activeStatusFilter === statut ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter(statut)}
                      className={`text-xs transition-all duration-200 ${
                        activeStatusFilter === statut 
                          ? getStatusColor(statut)
                          : "hover:bg-muted"
                      }`}
                    >
                      {statut}
                      <Badge variant="secondary" className="ml-2">
                        {annonces.filter(annonce => annonce.statut === statut).length}
                      </Badge>
                    </Button>
                  ))}
                </div>
                
                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {annonces.filter(annonce => annonce.statut === 'Entrepot').length}
                      </div>
                      <div className="text-sm text-gray-600">Entrepôt</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {annonces.filter(annonce => annonce.statut === 'En cours').length}
                      </div>
                      <div className="text-sm text-gray-600">En cours</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {annonces.filter(annonce => annonce.statut === 'Terminé').length}
                      </div>
                      <div className="text-sm text-gray-600">Terminé</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {annonces.filter(annonce => annonce.statut === 'Annulé').length}
                      </div>
                      <div className="text-sm text-gray-600">Annulé</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {annonces.filter(annonce => annonce.is_boost).length}
                      </div>
                      <div className="text-sm text-gray-600">Boostées</div>
                    </div>
                  </div>
                </div>

                {/* Indicateur de filtres actifs */}
                {activeStatusFilter && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Filter className="h-4 w-4" />
                      <span className="font-medium">
                        Filtrage par statut : {activeStatusFilter}
                      </span>
                      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                        {filteredAnnonces.length} trajet{filteredAnnonces.length > 1 ? 's' : ''} trouvé{filteredAnnonces.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAnnonces.map((annonceItem) => (
                  <Card
                    key={annonceItem.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck
                            className={`h-5 w-5 ${
                              annonceItem.type_transport === "express"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {annonceItem.type_transport === "express"
                              ? "Express"
                              : "Economy"}
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
                          {annonceItem.stock_annonce
                            ? `${annonceItem.stock_annonce}kg max`
                            : "Poids non spécifié"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Tarif par kilo:{" "}
                          {annonceItem.poids_max
                            ? `${annonceItem.poids_max} ${annonceItem.devise_prix}`
                            : "Non spécifié"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatDate(annonceItem.date_depart)} →{" "}
                          {formatDate(annonceItem.date_arrive)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {annonceItem.poids_max
                            ? `${annonceItem.poids_max} ${annonceItem.devise_prix}`
                            : "Prix non spécifié"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            annonceItem.statut
                          )}`}
                        >
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
                      <div className="w-full grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => handleDeleteClick(annonceItem)}
                          variant="destructive"
                          size="sm"
                          className="font-bold gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                        <Button
                          onClick={() => handleAnnonceClick(annonceItem)}
                          size="sm"
                          variant="outline"
                          className="font-bold gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </Button>
                        <Button
                          onClick={() => handleOpenCommandes(annonceItem)}
                          size="sm"
                          variant="secondary"
                          className="font-bold gap-1"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Commandes
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Message si aucun résultat */}
              {filteredAnnonces.length === 0 && activeStatusFilter && (
                <div className="text-center py-12">
                  <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Aucun trajet trouvé
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucun trajet avec le statut "{activeStatusFilter}" n'a été trouvé.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="font-bold"
                    >
                      Effacer les filtres
                    </Button>
                  </div>
                </div>
              )}

              {annonces.length === 0 && (
                <div className="text-center py-12">
                  <Book className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucun trajet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Commencez par ajouter un nouveau trajet.
                  </p>
                  <div className="mt-6">
                    <Button
                      type="button"
                      className="font-bold bg-red-600"
                      onClick={handleAddAnnonceClick}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un trajet
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <ConfirmDialog
            isOpen={isDialogOpen}
            message={`Êtes-vous sûr de vouloir supprimer le trajet : ${selectedAnnonceTitle} ?`}
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
        </div>
      </div>

      {/* Drawer pour ajouter/modifier une annonce */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={closeDrawer}>
        <div className="p-4 flex items-center justify-center h-full w-[40vw] overflow-y-auto">
          {isAddingAnnonce ? (
            <div className="flex w-full max-w-2xl flex-col items-center border bg-white p-6 text-left">
              <div className="flex items-center justify-between w-full mb-6">
                <h2 className="text-2xl font-bold">
                  Ajouter une Nouvelle Annonce
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeDrawer}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form className="w-full space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="type_transport"
                      className="block text-sm font-bold mb-2"
                    >
                      Type de Transport
                    </Label>
                    <select
                      id="type_transport"
                      name="type_transport"
                      value={annonce.type_transport}
                      onChange={(e) =>
                        handleSelectChange("type_transport", e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="economy">Economy</option>
                      <option value="express">Express</option>
                    </select>
                  </div>

                  <div>
                    <Label
                      htmlFor="devise_prix"
                      className="block text-sm font-bold mb-2"
                    >
                      Devise
                    </Label>
                    <select
                      id="devise_prix"
                      name="devise_prix"
                      value={annonce.devise_prix}
                      onChange={(e) =>
                        handleSelectChange("devise_prix", e.target.value)
                      }
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
                    <Label
                      htmlFor="source"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="destination"
                      className="block text-sm font-bold mb-2"
                    >
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
                  <Label
                    htmlFor="lieu_depot"
                    className="block text-sm font-bold mb-2"
                  >
                    Lieu de Dépôt
                  </Label>
                  <Input
                    type="text"
                    id="lieu_depot"
                    name="lieu_depot"
                    value={annonce.lieu_depot || ""}
                    onChange={handleInputChange}
                    placeholder="Adresse du lieu de dépôt"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="poids_max"
                      className="block text-sm font-bold mb-2"
                    >
                      Tarif par kilo
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
                    <Label
                      htmlFor="stock_annonce"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="date_depart"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="date_arrive"
                      className="block text-sm font-bold mb-2"
                    >
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
                    {annonce.date_depart && annonce.date_arrive && !validateDates(annonce.date_depart, annonce.date_arrive) && (
                      <p className="text-red-500 text-xs mt-1">
                        La date d'arrivée doit être après la date de départ
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="sourceAddress"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="destinationAddress"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="statut"
                      className="block text-sm font-bold mb-2"
                    >
                      Statut
                    </Label>
                    <Select
                      value={annonce.statut}
                      onValueChange={(value) =>
                        handleSelectChange("statut", value)
                      }
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
                        onCheckedChange={(checked) =>
                          handleSwitchChange("is_boost", checked)
                        }
                      />
                      <Label htmlFor="is_boost" className="text-sm font-medium">
                        Annonce boostée
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 w-full flex justify-center">
                  <Button 
                    type="submit" 
                    className="w-fit h-10 font-bold"
                    disabled={Boolean(annonce.date_depart && annonce.date_arrive && !validateDates(annonce.date_depart, annonce.date_arrive))}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex w-full max-w-2xl flex-col items-center border bg-white p-6 text-left">
              <div className="flex items-center justify-between w-full mb-6">
                <h2 className="text-2xl font-bold">Modifier l'annonce</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeDrawer}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmitEdit} className="w-full space-y-4">
                {/* Même formulaire que pour l'ajout, mais avec les valeurs pré-remplies */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="type_transport-edit"
                      className="block text-sm font-bold mb-2"
                    >
                      Type de Transport
                    </Label>
                    <select
                      id="type_transport-edit"
                      name="type_transport"
                      value={annonce.type_transport}
                      onChange={(e) =>
                        handleSelectChange("type_transport", e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="economy">Economy</option>
                      <option value="express">Express</option>
                    </select>
                  </div>

                  <div>
                    <Label
                      htmlFor="devise_prix-edit"
                      className="block text-sm font-bold mb-2"
                    >
                      Devise
                    </Label>
                    <select
                      id="devise_prix-edit"
                      name="devise_prix"
                      value={annonce.devise_prix}
                      onChange={(e) =>
                        handleSelectChange("devise_prix", e.target.value)
                      }
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
                    <Label
                      htmlFor="source-edit"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="destination-edit"
                      className="block text-sm font-bold mb-2"
                    >
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
                  <Label
                    htmlFor="lieu_depot-edit"
                    className="block text-sm font-bold mb-2"
                  >
                    Lieu de Dépôt
                  </Label>
                  <Input
                    type="text"
                    id="lieu_depot-edit"
                    name="lieu_depot"
                    value={annonce.lieu_depot || ""}
                    onChange={handleInputChange}
                    placeholder="Adresse du lieu de dépôt"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="poids_max-edit"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="stock_annonce-edit"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="date_depart-edit"
                      className="block text-sm font-bold mb-2"
                    >
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
                    <Label
                      htmlFor="date_arrive-edit"
                      className="block text-sm font-bold mb-2"
                    >
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
                    {annonce.date_depart && annonce.date_arrive && !validateDates(annonce.date_depart, annonce.date_arrive) && (
                      <p className="text-red-500 text-xs mt-1">
                        La date d'arrivée doit être après la date de départ
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="sourceAddress-edit"
                      className="block text-sm font-bold mb-2"
                    >
                      Adresse Source (optionnel)
                    </Label>
                    <Textarea
                      id="sourceAddress-edit"
                      name="sourceAddress"
                      value={annonce.sourceAddress || ""}
                      onChange={handleInputChange}
                      placeholder="Adresse complète de départ"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="destinationAddress-edit"
                      className="block text-sm font-bold mb-2"
                    >
                      Adresse Destination (optionnel)
                    </Label>
                    <Textarea
                      id="destinationAddress-edit"
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
                    <Label
                      htmlFor="statut-edit"
                      className="block text-sm font-bold mb-2"
                    >
                      Statut
                    </Label>
                    <Select
                      value={annonce.statut}
                      onValueChange={(value) =>
                        handleSelectChange("statut", value)
                      }
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
                        onCheckedChange={(checked) =>
                          handleSwitchChange("is_boost", checked)
                        }
                      />
                      <Label
                        htmlFor="is_boost-edit"
                        className="text-sm font-medium"
                      >
                        Annonce boostée
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 w-full flex justify-center space-x-4">
                  <Button 
                    type="submit" 
                    className="font-bold gap-2"
                    disabled={Boolean(annonce.date_depart && annonce.date_arrive && !validateDates(annonce.date_depart, annonce.date_arrive))}
                  >
                    <Save />
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    onClick={closeDrawer}
                    variant="outline"
                    className="font-bold"
                  >
                    <X />
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Drawer>

      {/* Drawer pour afficher les commandes */}
      <Drawer anchor="right" open={isCommandesDrawerOpen} onClose={handleCloseCommandes}>
        <div className="p-4 flex items-center justify-center h-full w-[80vw] max-w-7xl">
          <div className="flex w-full max-w-none flex-col h-full border bg-white rounded-lg overflow-hidden">
            {/* Header fixe avec gestion de l'annonce */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between w-full mb-6">
                <h2 className="text-2xl font-bold">
                  Commandes du trajet
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseCommandes}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="w-full">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {annonce.source} → {annonce.destination}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ID: {annonce.id_annonce} | Statut: {annonce.statut}
                  </p>
                </div>

                {/* Contrôle du statut de l'annonce - TOUJOUR VISIBLE */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="text-sm min-w-0">
                    <div className="font-medium text-gray-900">Statut du trajet</div>
                    <div className="text-gray-600">Gérer le statut</div>
                  </div>
                  
                  {/* Indicateur du statut actuel */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-blue-200">
                    <div className={`w-3 h-3 rounded-full ${
                      annonce.statut === 'Entrepot' ? 'bg-blue-500' :
                      annonce.statut === 'En cours' ? 'bg-yellow-500' :
                      annonce.statut === 'Terminé' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {annonce.statut === 'Entrepot' ? '🔄 En attente' :
                       annonce.statut === 'En cours' ? '🚚 En cours' :
                       annonce.statut === 'Terminé' ? '✅ Terminé' :
                       '❌ Annulé'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Bouton de démarrage principal */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={annonce.statut === 'En cours' ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 px-4 font-medium transition-all duration-200 ${
                          annonce.statut === 'En cours'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400'
                        }`}
                        onClick={() => {
                          if (annonce.statut === 'Entrepot') {
                            handleUpdateAnnonceStatus('En cours');
                          } else if (annonce.statut === 'En cours') {
                            handleUpdateAnnonceStatus('Entrepot');
                          }
                        }}
                      >
                        {annonce.statut === 'En cours' ? (
                          <>
                            <Truck className="h-4 w-4 mr-2" />
                            Trajet en cours
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Démarrer le trajet
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        onClick={() => handleUpdateAnnonceStatus('Terminé')}
                        disabled={annonce.statut !== 'En cours'}
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Terminer
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        onClick={() => handleUpdateAnnonceStatus('Annulé')}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu scrollable - Commandes */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isLoadingCommandes ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Chargement des commandes...
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Récupération des données en cours
                  </p>
                </div>
              ) : annonceCommandes.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">
                      Commandes associées ({annonceCommandes.length})
                    </h4>
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Rechercher une commande..."
                        className="w-56 h-8 text-sm"
                      />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-28 h-8 text-sm">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="Entrepot">Entrepôt</SelectItem>
                          <SelectItem value="En cours">En cours</SelectItem>
                          <SelectItem value="Terminé">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Tableau des commandes */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
                    <div className="w-full">
                      <table className="w-full table-fixed">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Commande
                            </th>
                            <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Client
                            </th>
                            <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Détails
                            </th>
                            <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Statut
                            </th>
                            <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {annonceCommandes.map((commande, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              {/* Numéro de commande */}
                              <td className="w-24 px-3 py-3">
                                <div className="flex items-center">
                                  <span className="font-bold text-blue-600 text-sm">#{commande.id}</span>
                                </div>
                              </td>
                              
                              {/* Client */}
                              <td className="w-48 px-3 py-3">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    {commande.client?.img_url ? (
                                      <img
                                        className="h-8 w-8 rounded-full object-cover"
                                        src={commande.client.img_url}
                                        alt="Avatar"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600">
                                          {commande.client?.prenom?.[0]}{commande.client?.nom?.[0]}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-3 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {commande.client?.prenom} {commande.client?.nom}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                      {commande.client?.ville}
                                      {commande.client?.Pays && `, ${commande.client.Pays}`}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              {/* Contact */}
                              <td className="w-32 px-3 py-3">
                                <div className="text-sm text-gray-900 truncate">
                                  {commande.client?.Tel}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {new Date(commande.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </td>
                              
                              {/* Détails */}
                              <td className="w-48 px-3 py-3">
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="capitalize">{commande.detail_commande?.mode}</span>
                                    <span>•</span>
                                    <span className="truncate">{commande.detail_commande?.type}</span>
                                  </div>
                                  <div className="text-gray-500">
                                    {commande.detail_commande?.articles?.length || 0} article(s)
                                  </div>
                                  <div className="font-medium text-green-600">
                                    {commande.total_price} €
                                  </div>
                                </div>
                              </td>
                              
                              {/* Statut */}
                              <td className="w-32 px-3 py-3">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    commande.statut === 'Entrepot'
                                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                                      : commande.statut === 'En cours'
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                      : commande.statut === 'Terminé'
                                      ? 'bg-green-100 text-green-800 border-green-300'
                                      : commande.statut === 'Annulé'
                                      ? 'bg-red-100 text-red-800 border-red-300'
                                      : 'bg-gray-100 text-gray-800 border-gray-300'
                                  }`}
                                >
                                  {commande.statut || 'Non défini'}
                                </Badge>
                                {commande.payment_status && (
                                  <div className="mt-1">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        commande.payment_status === 'paid'
                                          ? 'bg-green-100 text-green-800 border-green-300'
                                          : 'bg-red-100 text-red-800 border-red-300'
                                      }`}
                                    >
                                      {commande.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                                    </Badge>
                                  </div>
                                )}
                              </td>
                              
                              {/* Actions */}
                              <td className="w-64 px-3 py-3">
                                <div className="flex items-center gap-2">
                                  {/* Bouton Préparer en Entrepôt (si commande validée et pas encore préparée) */}
                                  {commande.validation_status && !commande.warehouse_info && (
                                    <Button
                                      size="sm"
                                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1"
                                                                              onClick={() => {
                                          setSelectedCommandeForWarehouse(commande);
                                          setWarehousePrice("");
                                          setWarehouseWeight("");
                                          setWarehouseTransportType("");
                                          setWarehousePhotos([]);
                                          setWarehouseError("");
                                          setOpenWarehouseDialog(true);
                                        }}
                                    >
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4"
                                        />
                                      </svg>
                                      Préparer
                                    </Button>
                                  )}
                                  
                                  {/* Indicateur si déjà préparée */}
                                  {commande.warehouse_info && (
                                    <div className="flex flex-col gap-1">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-300">
                                        <svg
                                          className="w-3 h-3 text-green-700"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        Préparée
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-1 py-1 h-6"
                                          title="Voir les informations du warehouse"
                                          onClick={() => {
                                            setSelectedCommandeForWarehouse(commande);
                                            setOpenWarehouseViewDialog(true);
                                          }}
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-green-600 border-green-200 hover:bg-green-50 text-xs px-1 py-1 h-6"
                                          title="Modifier les informations du warehouse"
                                          onClick={() => {
                                            setSelectedCommandeForWarehouse(commande);
                                            setWarehousePrice(commande.warehouse_info.price.toString());
                                            setWarehouseWeight(commande.warehouse_info.weight.toString());
                                            setWarehouseTransportType(commande.warehouse_info.transport_type || '');
                                            setWarehousePhotos([]);
                                            setWarehouseError("");
                                            setOpenWarehouseDialog(true);
                                          }}
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  

                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Aucune commande
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucune commande n'est associée à ce trajet pour le moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Modal de préparation en entrepôt */}
      {openWarehouseDialog && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
                                onClick={() => setOpenWarehouseDialog(false)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCommandeForWarehouse?.warehouse_info ? 'Modifier la Préparation' : 'Préparation en Entrepôt'}
                    </h3>
                  </div>
                  
                  {selectedCommandeForWarehouse ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Commande #{selectedCommandeForWarehouse.id} - {selectedCommandeForWarehouse.detail_commande?.type}
                      </p>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="warehousePrice" className="text-sm font-medium text-gray-700">
                              Prix (XOF)
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="warehousePrice"
                                type="text"
                                inputMode="decimal"
                                value={warehousePrice}
                                onChange={(e) => setWarehousePrice(e.target.value)}
                                placeholder="Ex: 1500.50"
                                className="pr-8"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                XOF
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Ex: 1500.50 pour 1500 XOF et 50 centimes
                            </p>
                            {/* Raccourcis de valeurs rapides */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              <button
                                type="button"
                                onClick={() => setWarehousePrice('1000')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                              >
                                1000
                              </button>
                              <button
                                type="button"
                                onClick={() => setWarehousePrice('1500')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                              >
                                1500
                              </button>
                              <button
                                type="button"
                                onClick={() => setWarehousePrice('2000')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                              >
                                2000
                              </button>
                              <button
                                type="button"
                                onClick={() => setWarehousePrice('2500')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                              >
                                2500
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="warehouseWeight" className="text-sm font-medium text-gray-700">
                              Poids (kg)
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="warehouseWeight"
                                type="text"
                                inputMode="decimal"
                                value={warehouseWeight}
                                onChange={(e) => setWarehouseWeight(e.target.value)}
                                placeholder="Ex: 2.5"
                                className="pr-8"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                kg
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Ex: 2.5 pour 2 kg et 500 grammes
                            </p>
                            {/* Raccourcis de valeurs rapides */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              <button
                                type="button"
                                onClick={() => setWarehouseWeight('1')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                              >
                                1 kg
                              </button>
                              <button
                                type="button"
                                onClick={() => setWarehouseWeight('2')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                              >
                                2 kg
                              </button>
                              <button
                                type="button"
                                onClick={() => setWarehouseWeight('5')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                              >
                                5 kg
                              </button>
                              <button
                                type="button"
                                onClick={() => setWarehouseWeight('10')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
                              >
                                10 kg
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="warehouseTransportType" className="text-sm font-medium text-gray-700">
                            Type de transport
                          </Label>
                          <Select
                            value={warehouseTransportType}
                            onValueChange={setWarehouseTransportType}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedCommandeForWarehouse?.annonce?.type_transport && (
                                <SelectItem value={selectedCommandeForWarehouse.annonce.type_transport}>
                                  {selectedCommandeForWarehouse.annonce.type_transport} (défini)
                                </SelectItem>
                              )}
                              <SelectItem value="express">Express</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="economy">Economy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="warehousePhotos" className="text-sm font-medium text-gray-700">
                            Photos de la commande
                          </Label>
                          <Input
                            id="warehousePhotos"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              setWarehousePhotos(
                                e.target.files ? Array.from(e.target.files) : []
                              )
                            }
                            className="mt-1"
                          />
                          {warehousePhotos.length > 0 && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                              <p className="text-sm text-gray-600 mb-2">
                                {warehousePhotos.length} photo(s) sélectionnée(s) :
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {warehousePhotos.map((file, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {file.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {warehouseError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-sm text-red-600 font-medium">
                                {warehouseError}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Chargement des informations de la commande...</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                                      onClick={() => setOpenWarehouseDialog(false)}
                    disabled={warehouseLoading}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setWarehousePrice("");
                      setWarehouseWeight("");
                      setWarehouseTransportType("");
                      setWarehousePhotos([]);
                      setWarehouseError("");
                    }}
                    disabled={warehouseLoading}
                    className="px-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </Button>
                  <Button
                                      onClick={() => handleWarehouseSubmit()}
                    disabled={warehouseLoading || !selectedCommandeForWarehouse}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {warehouseLoading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {selectedCommandeForWarehouse?.warehouse_info ? 'Modification...' : 'Enregistrement...'}
                      </span>
                    ) : (
                      selectedCommandeForWarehouse?.warehouse_info ? 'Modifier' : 'Confirmer'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de visualisation des informations du warehouse */}
      {openWarehouseViewDialog && selectedCommandeForWarehouse && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
            onClick={() => setOpenWarehouseViewDialog(false)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Informations du Warehouse
                    </h3>
                    <p className="text-sm text-gray-600">
                      Commande #{selectedCommandeForWarehouse.id}
                    </p>
                  </div>
                </div>

                {/* Informations du warehouse */}
                <div className="space-y-4">
                  {/* Prix */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="font-medium text-gray-700">Prix</span>
                      </div>
                      <span className="text-2xl font-bold text-green-700">
                        {Number(selectedCommandeForWarehouse.warehouse_info.price).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} XOF
                      </span>
                    </div>
                  </div>

                  {/* Poids */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <span className="font-medium text-gray-700">Poids</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-700">
                        {Number(selectedCommandeForWarehouse.warehouse_info.weight).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} kg
                      </span>
                    </div>
                  </div>

                  {/* Type de transport */}
                  {selectedCommandeForWarehouse.warehouse_info.transport_type && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-700">Type de transport</span>
                        </div>
                        <span className="text-lg font-semibold text-purple-700 capitalize">
                          {selectedCommandeForWarehouse.warehouse_info.transport_type}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Date de préparation */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-700">Préparée le</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {new Date(selectedCommandeForWarehouse.updated_at || selectedCommandeForWarehouse.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setOpenWarehouseViewDialog(false)}
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={() => {
                      setOpenWarehouseViewDialog(false);
                      setWarehousePrice(selectedCommandeForWarehouse.warehouse_info.price.toString());
                      setWarehouseWeight(selectedCommandeForWarehouse.warehouse_info.weight.toString());
                      setWarehouseTransportType(selectedCommandeForWarehouse.warehouse_info.transport_type || '');
                      setWarehousePhotos([]);
                      setWarehouseError("");
                      setOpenWarehouseDialog(true);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


