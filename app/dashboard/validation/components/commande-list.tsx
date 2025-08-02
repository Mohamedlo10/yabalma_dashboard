import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { FaArrowRight } from "react-icons/fa";
import { Commande } from "../schema";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { useCommande, useUpdateStats } from "../use-commande";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface commandeListProps {
  items: Commande[];
  onItemUpdate?: (updatedItem: Commande) => void;
}
import { Button } from "@/components/ui/button";
import { Eye, Clock, AlertCircle, Unlock } from "lucide-react";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import {
  validerCommande,
  updateValidationStatus,
} from "@/app/api/commandes/query";
import Drawer from "@mui/material/Drawer";
import ArticlesList from "@/components/ui/article/article-list";
import { getSupabaseUser } from "@/lib/authMnager";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export function CommandeList({ items, onItemUpdate }: commandeListProps) {
  const [commande, setCommande] = useCommande();
  const [isLoading, setIsLoading] = useState(false);
  const [color] = useState("#ffffff");
  const [_, updateStats] = useUpdateStats();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Commande | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [blockingCommandeId, setBlockingCommandeId] = useState<number | null>(
    null
  );
  const [localBlockedItems, setLocalBlockedItems] = useState<{
    [key: number]: { email: string; name?: string };
  }>({});

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

  const handleOpenDrawer = (item: Commande) => {
    setActiveItem(item);
    setDrawerOpen(true);

    // Si vous avez déjà ouvert le site dans un autre onglet, vous pouvez le noter
    localStorage.setItem("lastViewedOrder", item.id.toString());
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleConfirmValidation = (isValidated: boolean) => {
    setConfirmDialogOpen(false);

    if (isValidated && activeItem) {
      // Vérifier si la commande est bloquée par quelqu'un d'autre
      if (isButtonBlocked(activeItem) && !canUnblockButton(activeItem)) {
        console.log(
          "Commande bloquée par quelqu'un d'autre, validation impossible"
        );
        return;
      }
      ConfirmerCommande(activeItem.id);
    }
  };

  const ConfirmerCommande = async (id: number) => {
    setIsLoading(true);
    try {
      if (id && currentUser) {
        const response = await validerCommande(id, currentUser.email);
        console.log("Confirmation reussi", response);

        // Mettre à jour directement l'état local
        if (activeItem) {
          const updatedItem = {
            ...activeItem,
            validation_status: true,
            mail_valideur: currentUser.email,
          };
          setActiveItem(updatedItem);
        }

        // Mettre à jour la liste des items
        const updatedItems = items.map((item) =>
          item.id === id
            ? {
                ...item,
                validation_status: true,
                mail_valideur: currentUser.email,
              }
            : item
        );

        // Notifier le composant parent de la mise à jour
        if (onItemUpdate) {
          const updatedItem = updatedItems.find((item) => item.id === id);
          if (updatedItem) {
            onItemUpdate(updatedItem);
          }
        }

        // Rafraîchir les données
        await updateStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la confirmation de la commande:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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
    <ScrollArea className="h-[70vh] ">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 pb-80 gap-2 p-4 pt-0">
        {items.map((item) => (
          <Card key={item.id} className="w-full max-w-2xl mx-auto shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="md:text-base flex flex-row gap-1 text-sm font-semibold text-gray-800">
                Commande #{item.id}
                <p className="text-zinc-500">
                  {item.detail_commande?.type || "N/A"}
                </p>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {/* Section Client */}
              <div className="p-4 border-b">
                <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-2">
                  Information Client
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Client</p>
                    <p className="font-medium text-xs md:text-sm">
                      {item.client?.prenom} {item.client?.nom}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Téléphone
                    </p>
                    <p className="font-medium text-xs md:text-sm">
                      {item.client?.Tel}
                    </p>
                  </div>

                  {/* <div>
                    <p className="text-xs md:text-sm text-gray-500">Adresse</p>
                    <p className="font-medium text-xs md:text-sm">
                      {item.client?.Pays} {item.client?.ville}
                    </p>
                  </div> */}
                </div>
              </div>

              {/* Section Commande */}
              <div className="p-4">
                <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-2">
                  Détails de la Commande
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Date</p>
                    <p className="font-medium text-xs md:text-sm">
                      {item.annonce.created_at &&
                        format(
                          new Date(item.annonce.created_at),
                          "dd MMMM yyyy",
                          {
                            locale: fr,
                          }
                        )}
                      {" à "}
                      {item.annonce.created_at &&
                        format(new Date(item.annonce.created_at), "HH:mm", {
                          locale: fr,
                        })}
                    </p>
                  </div>
                  {/*  <div>
                    <p className="text-xs md:text-sm text-gray-500">Trajet</p>
                    <p className="font-medium text-xs md:text-sm">
                      {item.annonce.source} - {item.annonce.destination}
                    </p>
                  </div> */}
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Statut</p>

                    <span
                      className={`inline-flex items-center p-2 rounded-md  font-medium text-xs md:text-sm ${
                        !item.validation_status
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-900"
                      }`}
                    >
                      {item.validation_status ? "Validé" : "Non validé"}
                    </span>
                    {item.validation_status && item.mail_valideur && (
                      <div className="text-xs text-gray-500 mt-1">
                        Validé par : <strong>{item.mail_valideur}</strong>
                      </div>
                    )}
                  </div>
                  {/* <div>
                    <p className="text-xs md:text-sm text-gray-500">Prix</p>
                    <p className="font-medium text-xs md:text-lg ">
                      {item.total_price}{" "}
                      {item.detail_commande?.articles[0].currency}
                    </p>
                  </div> */}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center gap-4 p-4 bg-gray-50 border-t">
              {!item.validation_status ? (
                <div className="flex-1 max-w-xs">
                  {isButtonBlocked(item) ? (
                    <div className="flex flex-col gap-2">
                      <Button
                        className="w-full bg-gray-400 cursor-not-allowed"
                        disabled={true}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>En cours de validation</span>
                        </div>
                      </Button>
                      <div className="text-xs text-gray-600 text-center">
                        Validé par :{" "}
                        <strong>{getBlockedByUser(item)?.email}</strong>
                      </div>
                      {canUnblockButton(item) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unblockButton(item.id)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs"
                          disabled={blockingCommandeId === item.id}
                        >
                          {blockingCommandeId === item.id ? (
                            <div className="flex items-center gap-2">
                              <BeatLoader color="#3b82f6" size={8} />
                              <span>Déblocage...</span>
                            </div>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 mr-1" />
                              Débloquer
                            </>
                          )}
                        </Button>
                      )}
                      {/* Bouton pour ouvrir le drawer même si bloqué */}
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                        onClick={() => handleOpenDrawer(item)}
                      >
                        Voir les détails
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleOpenDrawer(item)}
                    >
                      Valider cette commande
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex-1 max-w-xs">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleOpenDrawer(item)}
                  >
                    Voir les détails
                  </Button>
                </div>
              )}
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
            PaperProps={{ sx: { width: "83%" } }}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 bg-gray-100 flex justify-between items-center border-b">
                <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2">
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold mr-2">
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
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">
                        {activeItem.client?.nom} {activeItem.client?.prenom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prix</p>
                      <p className="font-medium">
                        {activeItem.total_price}{" "}
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
                  <h4 className="font-semibold text-gray-700 mb-3">Colis</h4>
                  <ArticlesList
                    articles={activeItem?.detail_commande?.articles || []}
                    variant="modern"
                  />
                </div>
              </div>
            </div>
          </Drawer>
          <Dialog
            open={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
          >
            <DialogTitle>Confirmation de validation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Avez-vous validé la commande #{activeItem.id} sur le site
                externe ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleConfirmValidation(false)}
                color="primary"
              >
                Non
              </Button>
              <Button
                className="bg-green-400"
                onClick={() => handleConfirmValidation(true)}
                autoFocus
              >
                Oui
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </ScrollArea>
  );
}
