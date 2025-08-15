import { format, formatDistanceToNow } from "date-fns";
import {
  Drawer,
  Dialog as MuiDialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogContentText as MuiDialogContentText,
  DialogTitle as MuiDialogTitle,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { CSSProperties, useCallback, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Commande } from "../schema";
import { useCommande, useUpdateStats } from "../use-commande";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseUser } from "@/lib/authMnager";
interface commandeListProps {
  items: Commande[];
  onItemUpdate?: (updatedItem: Commande) => void;
}
import { Button } from "@/components/ui/button";
import {
  validerCommande,
  updateValidationStatus,
} from "@/app/api/commandes/query";
import { fr } from "date-fns/locale";
import { AlertCircle, CheckCircle, Clock, RefreshCw, Unlock, X } from "lucide-react";
import ArticlesList from "@/components/ui/article/article-list";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export function CommandeList({ items: initialItems, onItemUpdate }: commandeListProps) {
  // ...
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [refundPaymentMethod, setRefundPaymentMethod] = useState<string>("");
  const [showRefundSuccess, setShowRefundSuccess] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const [commande, setCommande] = useCommande();
  const [color] = useState("#ffffff");
  const updateStats = useUpdateStats()[1]; // On ne prend que le setter
  const router = useRouter();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Commande | null>(null);
  const [items, setItems] = useState<Commande[]>(initialItems);
  const [isRefundMode, setIsRefundMode] = useState(false);
  const [selectedRefundArticles, setSelectedRefundArticles] = useState<number[]>([]);
const [refundAmount, setRefundAmount] = useState<number>(0);
const [refundCurrency, setRefundCurrency] = useState<string>('XOF');
  const [blockingCommandeId, setBlockingCommandeId] = useState<number | null>(null);
  const [localBlockedItems, setLocalBlockedItems] = useState<{
    [key: number]: { email: string; name?: string };
  }>({});
  const [isBlocking, setIsBlocking] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mettre à jour les items quand initialItems change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const user = getSupabaseUser();
    setCurrentUser(user);
  }, []);

  // Fonction pour bloquer un bouton (mettre validationPending à true)
  const blockButton = async (commandeId: number) => {
    if (!currentUser) return;

    setBlockingCommandeId(commandeId); // Démarrer le loader

    // Mise à jour immédiate de l'état local
    setLocalBlockedItems((prev) => ({
      ...prev,
      [commandeId]: {
        email: currentUser.email,
        name: currentUser.user_metadata?.name || currentUser.email,
      },
    }));

    // Sauvegarder dans localStorage ET dans la DB simultanément
    const blockedInfo = {
      email: currentUser.email,
      name: currentUser.user_metadata?.name || currentUser.email,
    };

    // Sauvegarder dans localStorage
    localStorage.setItem(
      `blockedButton_${commandeId}`,
      JSON.stringify(blockedInfo)
    );

    try {
      // Sauvegarder dans la DB
      await updateValidationStatus(commandeId, true, currentUser.email);
      // Rafraîchir les données
      await updateStats();
    } catch (error) {
      console.error("Erreur lors du blocage de la commande:", error);
      // En cas d'erreur, annuler les changements locaux
      setLocalBlockedItems((prev) => {
        const newState = { ...prev };
        delete newState[commandeId];
        return newState;
      });
      localStorage.removeItem(`blockedButton_${commandeId}`);
    } finally {
      setBlockingCommandeId(null); // Arrêter le loader
    }
  };

  // Fonction pour débloquer un bouton (mettre validationPending à false)
  const unblockButton = async (commandeId: number) => {
    if (!currentUser) return;

    setBlockingCommandeId(commandeId); // Démarrer le loader

    // Mise à jour immédiate de l'état local
    setLocalBlockedItems((prev) => {
      const newState = { ...prev };
      delete newState[commandeId];
      return newState;
    });

    // Supprimer du localStorage ET de la DB simultanément
    localStorage.removeItem(`blockedButton_${commandeId}`);

    try {
      // Supprimer de la DB
      await updateValidationStatus(commandeId, false, null);
      // Rafraîchir les données
      await updateStats();
    } catch (error) {
      console.error("Erreur lors du déblocage de la commande:", error);
      // En cas d'erreur, restaurer l'état local
      const blockedData = localStorage.getItem(`blockedButton_${commandeId}`);
      if (blockedData) {
        const blockedInfo = JSON.parse(blockedData);
        setLocalBlockedItems((prev) => ({
          ...prev,
          [commandeId]: blockedInfo,
        }));
      }
    } finally {
      setBlockingCommandeId(null); // Arrêter le loader
    }
  };

  // Fonction pour vérifier si un bouton est bloqué (combine DB + localStorage)
  const isButtonBlocked = (commande: Commande): boolean => {
    // Vérifier d'abord l'état local (feedback immédiat)
    if (localBlockedItems[commande.id]) return true;
    // Sinon vérifier la DB
    return commande.validationPending === true;
  };

  // Fonction pour vérifier si l'utilisateur actuel peut débloquer le bouton
  const canUnblockButton = (commande: Commande): boolean => {
    if (!currentUser) return false;
    // Vérifier d'abord l'état local
    const localBlocked = localBlockedItems[commande.id];
    if (localBlocked && localBlocked.email === currentUser.email) return true;
    // Sinon vérifier la DB
    return commande.mail_valideur === currentUser.email;
  };

  // Fonction pour obtenir l'utilisateur qui a bloqué (combine DB + localStorage)
  const getBlockedByUser = (commande: Commande) => {
    // Vérifier d'abord l'état local
    const localBlocked = localBlockedItems[commande.id];
    if (localBlocked) {
      return {
        email: localBlocked.email,
        name: localBlocked.name || localBlocked.email,
      };
    }
    // Sinon vérifier la DB
    if (!commande.mail_valideur) return null;
    return {
      email: commande.mail_valideur,
      name: commande.mail_valideur,
    };
  };

  // Restaurer les blocages locaux au chargement
  useEffect(() => {
    const restoreLocalBlockedItems = () => {
      const newLocalBlockedItems: {
        [key: number]: { email: string; name?: string };
      } = {};

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("blockedButton_")) {
          const commandeId = parseInt(key.replace("blockedButton_", ""));
          const blockedData = localStorage.getItem(key);

          if (blockedData) {
            try {
              const blockedInfo = JSON.parse(blockedData);
              newLocalBlockedItems[commandeId] = blockedInfo;
            } catch (error) {
              console.error(
                "Erreur lors du parsing des données bloquées:",
                error
              );
              localStorage.removeItem(key);
            }
          }
        }
      });

      setLocalBlockedItems(newLocalBlockedItems);
    };

    restoreLocalBlockedItems();
  }, []);

  const handleOpenDrawer = useCallback((item: Commande) => {
    setActiveItem(item);
    setDrawerOpen(true);
  }, [setActiveItem, setDrawerOpen]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Reset active item after animation completes
    setTimeout(() => {
      setActiveItem(null);
    }, 300);
  }, []);

  const handleConfirmValidation = useCallback(async (confirmed: boolean) => {
    if (!activeItem) return;

    if (!confirmed) {
      setConfirmDialogOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Appel de validerCommande avec les bons paramètres
      const result = await validerCommande(activeItem.id, currentUser?.email || undefined);
      
      if (result.message === 'La commande est déjà validée') {
        console.log('La commande était déjà validée');
      }

      // Créer la commande mise à jour avec les propriétés valides
      const updatedItem: Commande = {
        ...activeItem,
        validation_status: true,
        mail_valideur: currentUser?.email || null,
        validationPending: false
      };

      // Mettre à jour l'état local
      setItems((prevItems: Commande[]) =>
        prevItems.map((item) =>
          item.id === activeItem.id ? updatedItem : item
        )
      );

      // Mettre à jour via la prop de callback si fournie
      if (onItemUpdate) {
        onItemUpdate(updatedItem);
      }

      // Mettre à jour les stats
      if (updateStats) {
        await updateStats();
      }

      // Fermer la boîte de dialogue de confirmation
      setConfirmDialogOpen(false);

      // Fermer le drawer après un court délai
      setTimeout(() => {
        setDrawerOpen(false);
        setActiveItem(null);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la validation de la commande:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeItem, onItemUpdate, currentUser, updateStats]);

  const handleNavigation = (idCommande: number) => {
    router.push(`/dashboard/commandes/profile?id=${idCommande}`);
  };

  const handleOpenSite = async (item: Commande) => {
    const url = item.shop?.url || item.detail_commande?.whatsapp;
    if (url) {
      window.open(url, "_blank");
      // Bloquer le bouton pour cette commande seulement si elle n'est pas déjà validée
      if (!item.validation_status) {
        await blockButton(item.id);
      }
    }
  };

  
  if (items.length === 0) {
    return (
      <div className="text-xl items-center justify-center text-secondary-foreground flex w-full h-full mt-12">
        Aucun resultat
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
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
    <ScrollArea className="h-[75vh] ">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-80 gap-2 p-4 pt-0">
        {items.map((item) => (
      <Card className="w-full max-w-md mx-auto border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="text-foreground text-green-700 font-extrabold text-lg">#{item.id}</span>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  {item.detail_commande?.type || "Standard"}
                </span>
              </CardTitle>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.validation_status 
                  ? "bg-green-100 text-green-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {item.validation_status ? "✓ Validé" : "⏳ En attente"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-3 pb-4 space-y-3">
            {/* Client info compacte */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {item.client?.prenom} {item.client?.nom}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.client?.Tel}
                </span>
              </div>
            </div>

            {/* Date compacte */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Créé le</span>
              <span className="font-medium">
                {new Date(item.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-0">
            <div className="w-full space-y-2">
              {!item.validation_status ? (
               
               <div>
                  {!item.validationPending || currentUser?.email === item.mail_valideur ? (
                <button 
                  onClick={() => handleOpenDrawer(item)} 
                  className={`w-full ${currentUser?.email === item.mail_valideur ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-[#0E7D0A] hover:bg-[#0E7D0A]/80'} text-primary-foreground px-4 py-2 rounded-md text-sm font-bold transition-colors`}
                >
                  {currentUser?.email === item.mail_valideur ? 'Traiter la commande' : 'Valider la commande'}
                </button>
                ):(<div className="w-full bg-black opacity-60 text-center font-bold text-primary-foreground  px-4 py-2 rounded-md text-sm ">
                  Bloque par {item.mail_valideur}
                </div>)
                }
               </div>
               
                
              ) : (
                <button onClick={() => handleOpenDrawer(item)} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-bold transition-colors">
                  Voir les détails
                </button>
              )}
              {currentUser?.email === item.mail_valideur &&(
                <span className="text-xs text-muted-foreground font-bold">Bloqué par vous {item.mail_valideur}</span>
              )}
            </div>
          </CardFooter>
        </Card>
        ))}
      </div>

      {/* Drawer et Dialog en dehors de la boucle */}
      {activeItem && (
        <>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={handleCloseDrawer}
            PaperProps={{ sx: { width: isMobile ? '100%' : '83%' } }}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 bg-gray-100 flex justify-between items-center border-b">
                <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2">
                  <span className="inline-block bg-blue-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold mr-2">
                    Commande #{activeItem.id}
                  </span>
                  Validation
                </h3>
                <Button variant="default" onClick={handleCloseDrawer}>
                  Fermer
                </Button>
              </div>
              <div className="flex-grow overflow-auto p-4 xl:text-base text-xs space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow mb-6">
                  <h4 className="font-bold text-lg mb-2 text-yellow-800 flex items-center gap-2">
                    <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Instructions
                    </span>
                    de validation
                  </h4>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                    <li>
                      Cliquez sur "Ouvrir le site" pour accéder au site marchand
                    </li>
                    <li>Connectez-vous à votre compte si nécessaire</li>
                    <li>
                      Vérifiez les détails de la commande #{activeItem.id}
                    </li>
                    <li>Procédez à la validation sur le site</li>
                    <li>
                      Une fois terminé, revenez ici et cliquez sur "J'ai validé"
                    </li>
                  </ol>
                </div>

                {/* Message d'information si le bouton est bloqué */}
                {isButtonBlocked(activeItem) && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">
                        Validation en cours
                      </h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Cette commande est en cours de validation par{" "}
                      <strong>{getBlockedByUser(activeItem)?.email}</strong>.
                    </p>
                    {canUnblockButton(activeItem) && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unblockButton(activeItem.id)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          disabled={blockingCommandeId === activeItem.id}
                        >
                          {blockingCommandeId === activeItem.id ? (
                            <div className="flex items-center gap-2">
                              <BeatLoader color="#3b82f6" size={8} />
                              <span>Déblocage...</span>
                            </div>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Débloquer (vous avez bloqué cette validation)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
                  {(activeItem.shop?.url ||
                    activeItem.detail_commande?.whatsapp) && (
                    <Button
                      className={`w-full md:w-auto ${
                        isButtonBlocked(activeItem) &&
                        !canUnblockButton(activeItem)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      onClick={() => handleOpenSite(activeItem)}
                      disabled={
                        (isButtonBlocked(activeItem) &&
                          !canUnblockButton(activeItem)) ||
                        blockingCommandeId === activeItem.id
                      }
                    >
                      {blockingCommandeId === activeItem.id ? (
                        <div className="flex items-center gap-2">
                          <BeatLoader color="#ffffff" size={8} />
                          <span>Blocage en cours...</span>
                        </div>
                      ) : isButtonBlocked(activeItem) &&
                        !canUnblockButton(activeItem) ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Bloqué (Permanent)</span>
                        </div>
                      ) : (
                        "Ouvrir le site"
                      )}
                    </Button>
                  )}
                 
                  {!activeItem.validation_status && (
                    <Button
                      className={`w-full md:w-auto ${
                        isButtonBlocked(activeItem) &&
                        !canUnblockButton(activeItem)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      onClick={() => setConfirmDialogOpen(true)}
                      disabled={
                        isButtonBlocked(activeItem) &&
                        !canUnblockButton(activeItem)
                      }
                    >
                      {isButtonBlocked(activeItem) &&
                      !canUnblockButton(activeItem) ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            En cours de validation par{" "}
                            {getBlockedByUser(activeItem)?.email}
                          </span>
                        </div>
                      ) : (
                        "J'ai validé"
                      )}
                    </Button>
                  )}
                </div>
                <div className="border rounded-md p-4 bg-white shadow">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Détails de la commande
                  </h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">
                        {activeItem.client?.nom} {activeItem.client?.prenom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prix</p>
                      <p className="font-medium">
                        {activeItem.total_price?.slice(0, 8)}{" "}
                        {activeItem.detail_commande?.articles[0]?.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trajet</p>
                      <p className="font-medium">
                        {activeItem.annonce.source} -{" "}
                        {activeItem.annonce.destination}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-md p-4 bg-white shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between items-center mb-3">
                    <h4 className="sm:block hidden font-semibold text-gray-700">Colis</h4>
                       {isRefundMode && selectedRefundArticles.length > 0 && (
                      <div className="border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex gap-3 items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {selectedRefundArticles.length} article(s) sélectionné(s)
                            </span>
                            {/* Calcul de la somme totale à rembourser */}
                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                              Somme totale à rembourser : {
                                (() => {
                                  const articles = activeItem?.detail_commande?.articles || [];
                                  const total = articles
                                    .filter((art: any) => selectedRefundArticles.includes(art.id))
                                    .reduce((sum: number, art: any) => sum + (typeof art.totalPrice === 'number' ? art.totalPrice : (art.price || 0) * (art.quantity || 1)), 0);
                                  let currency = activeItem?.detail_commande?.articles[0]?.currency;
if (currency === '€' || currency === 'EURO') currency = 'EUR';
if (!currency || typeof currency !== 'string' || currency.length !== 3) currency = 'XOF';
return `${total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
                                })()
                              }
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              // Logique de traitement du remboursement
                              console.log("Traitement du remboursement pour les articles:", selectedRefundArticles);
                              setOpenRefundDialog(true);
                              // Réinitialiser la sélection après traitement
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmer le remboursement
                          </Button>
                        </div>
                      </div>
                  )}
                    <Button
                      size="sm"
                      variant={isRefundMode ? "default" : "outline"}
                      onClick={() => {
                        setSelectedRefundArticles([]);
                        setIsRefundMode(!isRefundMode);
                      }}
                      className={isRefundMode 
                        ? "bg-zinc-600 hover:bg-zinc-700 border-zinc-600 w-full md:w-auto md:mt-0 mt-2" 
                        : "text-blue-600 border-blue-300 hover:bg-blue-50 w-full md:w-auto mt-2"}
                    >
                      {isRefundMode ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Rembourser des articles
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {isRefundMode && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                      <p className="text-sm text-blue-800">
                        Sélectionnez les articles à rembourser
                      </p>
                    </div>
                  )}
                  
                  <ArticlesList
                    articles={activeItem?.detail_commande?.articles || []}
                    variant="modern"
                    selectable={isRefundMode}
                    selectedArticles={selectedRefundArticles}
                    onSelectionChange={(selectedIds) => {
                      setSelectedRefundArticles(selectedIds);
                      // Calcul du montant total à rembourser et devise
                      const articles = activeItem?.detail_commande?.articles || [];
                      const filtered = articles.filter((art: any) => selectedIds.includes(art.id));
                      const total = filtered.reduce((sum: number, art: any) => sum + (typeof art.totalPrice === 'number' ? art.totalPrice : (art.price || 0) * (art.quantity || 1)), 0);
                      let currency = filtered[0]?.currency || articles[0]?.currency;
                      if (currency === '€' || currency === 'EURO') currency = 'EUR';
                      if (!currency || typeof currency !== 'string' || currency.length !== 3) currency = 'XOF';
                      setRefundAmount(total);
                      setRefundCurrency(currency);
                      console.log("Articles sélectionnés:", selectedIds);
                    }}
                  />
                  
               
                </div>
              </div>
            </div>
          </Drawer>

      {/* Dialog de choix du mode de paiement pour remboursement - Version améliorée */}
<MuiDialog 
  open={openRefundDialog} 
  onClose={() => setOpenRefundDialog(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    className: "rounded-2xl shadow-2xl"
  }}
>
  <MuiDialogTitle className="pb-2">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Remboursement client</h2>
        <p className="text-sm text-gray-500 mt-1">Sélectionnez le mode de paiement</p>
      </div>
    </div>
  </MuiDialogTitle>

  <MuiDialogContent className="px-6 py-4">
    <div className="space-y-6">
      {/* Informations client */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium text-blue-900">Numéro de téléphone du client</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <span className="text-blue-900 font-medium text-lg">
              {activeItem?.client?.Tel || 'Non renseigné'}
            </span>
          </div>
        </div>
      </div>

      {/* Montant du remboursement */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="font-medium text-green-900">Montant à rembourser</span>
        </div>
        <div className="text-2xl font-bold text-green-800">
          {refundAmount.toLocaleString('fr-FR', { 
            style: 'currency', 
            currency: refundCurrency 
          })}
        </div>
      </div>

      {/* Modes de paiement */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900 mb-4">
          Mode de paiement
        </label>
        
        <div className="space-y-2">
          {/* Wave */}
          <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
            refundPaymentMethod === 'wave' 
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
              : 'border-gray-200'
          }`}>
            <input 
              type="radio" 
              name="refundPayment" 
              value="wave" 
              checked={refundPaymentMethod === 'wave'} 
              onChange={() => setRefundPaymentMethod('wave')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="ml-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Wave</span>
                <p className="text-sm text-gray-500">Paiement mobile Wave</p>
              </div>
            </div>
          </label>

          {/* Orange Money */}
          <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
            refundPaymentMethod === 'orange' 
              ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' 
              : 'border-gray-200'
          }`}>
            <input 
              type="radio" 
              name="refundPayment" 
              value="orange" 
              checked={refundPaymentMethod === 'orange'} 
              onChange={() => setRefundPaymentMethod('orange')}
              className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
            />
            <div className="ml-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">OM</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Orange Money</span>
                <p className="text-sm text-gray-500">Paiement mobile Orange</p>
              </div>
            </div>
          </label>

          {/* Carte bancaire */}
          <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
            refundPaymentMethod === 'cb' 
              ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
              : 'border-gray-200'
          }`}>
            <input 
              type="radio" 
              name="refundPayment" 
              value="cb" 
              checked={refundPaymentMethod === 'cb'} 
              onChange={() => setRefundPaymentMethod('cb')}
              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <div className="ml-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-900">Carte bancaire</span>
                <p className="text-sm text-gray-500">Remboursement sur carte</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Message d'information */}
      {refundPaymentMethod && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-amber-800 font-medium">Information importante</p>
              <p className="text-sm text-amber-700 mt-1">
                {refundPaymentMethod === 'wave' && "Le remboursement sera effectué sur le compte Wave du client sous 1-2 minutes."}
                {refundPaymentMethod === 'orange' && "Le remboursement sera effectué sur le compte Orange Money du client sous 1-2 minutes."}
                {refundPaymentMethod === 'cb' && "Le remboursement sera effectué sur la carte bancaire sous 3-5 jours ouvrés."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </MuiDialogContent>

  <MuiDialogActions className="px-6 py-4 bg-gray-50 rounded-b-2xl">
    <div className="flex gap-3 w-full">
      <Button 
        variant="outline" 
        onClick={() => setOpenRefundDialog(false)}
        className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-100"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Annuler
      </Button>
      
      <Button
        className={`flex-1 py-3 text-white font-medium transition-all duration-200 ${
          !refundPaymentMethod 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
        }`}
        disabled={!refundPaymentMethod}
        onClick={() => {
          setOpenRefundDialog(false);
          setShowRefundSuccess(true);
          // Réinitialiser la sélection après traitement
          setSelectedRefundArticles([]);
          setIsRefundMode(false);
          setRefundPaymentMethod("");
        }}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Confirmer le remboursement
      </Button>
    </div>
  </MuiDialogActions>
</MuiDialog>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => {
          // Logique de traitement du remboursement
          console.log("Traitement du remboursement pour les articles:", selectedRefundArticles);
          // Réinitialiser la sélection après traitement
          setSelectedRefundArticles([]);
          setIsRefundMode(false);
          setOpenRefundDialog(true);
        }}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Confirmer le remboursement
      </Button>
      {showRefundSuccess && (
        <div
          className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in"
          style={{ minWidth: 250, textAlign: 'center' }}
        >
          Remboursé avec succès !
          <button
            className="ml-4 text-white font-bold"
            onClick={() => setShowRefundSuccess(false)}
          >
            ×
          </button>
        </div>
      )}

          

          
          <MuiDialog
            open={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
          >
            <MuiDialogTitle>Confirmation de validation</MuiDialogTitle>
            <MuiDialogContent>
              <MuiDialogContentText>
                Avez-vous validé la commande #{activeItem?.id} sur le site externe ?
              </MuiDialogContentText>
            </MuiDialogContent>
            <MuiDialogActions>
              <Button
                variant="outline"
                onClick={() => handleConfirmValidation(false)}
              >
                Non
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleConfirmValidation(true)}
                autoFocus
              >
                {isLoading ? (
                  <BeatLoader color="#ffffff" size={8} />
                ) : (
                  'Oui, j\'ai validé'
                )}
              </Button>
            </MuiDialogActions>
          </MuiDialog>
        </>
      )}
    </ScrollArea>
  );
}
