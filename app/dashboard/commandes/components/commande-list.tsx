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
import { act, CSSProperties, useCallback, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { triggerWalletRefresh } from "@/hooks/use-wallet-refresh";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Commande } from "../schema";
import { useCommande, useUpdateStats } from "../use-commande";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseUser } from "@/lib/authMnager";
interface commandeListProps {
  items: Commande[];
  onItemUpdate?: (updatedItem: Commande) => void;
}
import { Button } from "@/components/ui/button";
import {
  validerCommande,
  updateValidationStatus,
  unblockValidationStatus,
  invalidateCommande,
  registerWarehouseInfo,
} from "@/app/api/commandes/query";
import { processRefund } from "@/app/api/payment/query";
import { extractCurrencyFromCommande } from "@/app/api/payment/query";
import { getWalletByUserId } from "@/app/api/wallets/query";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Unlock,
  X,
} from "lucide-react";
import ArticlesList from "@/components/ui/article/article-list";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

interface InvalidateResult {
  success?: boolean;
  error?: string;
  data?: any;
  message?: string;
}

export function CommandeList({
  items: initialItems,
  onItemUpdate,
}: commandeListProps) {
  // ...
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [refundPaymentMethod, setRefundPaymentMethod] = useState<string>("");
  const [showRefundSuccess, setShowRefundSuccess] = useState(false);

  // Entrepôt dialog state
  const [openWarehouseDialog, setOpenWarehouseDialog] = useState(false);
  const [warehousePrice, setWarehousePrice] = useState("");
  const [warehouseWeight, setWarehouseWeight] = useState("");
  const [warehouseTransportType, setWarehouseTransportType] = useState("");
  const [warehousePhotos, setWarehousePhotos] = useState<File[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseError, setWarehouseError] = useState("");

  // Handler for warehouse info registration
  const handleWarehouseSubmit = async () => {
    setWarehouseLoading(true);
    setWarehouseError("");
    try {
      if (!warehousePrice || !warehouseWeight) {
        setWarehouseError("Veuillez remplir tous les champs.");
        setWarehouseLoading(false);
        return;
      }
      // Prepare info object
      const info = {
        price: parseFloat(warehousePrice),
        weight: parseFloat(warehouseWeight),
        transport_type: warehouseTransportType,
      };
      if (activeItem?.id) {
        // Call API
        const result = await registerWarehouseInfo(
          activeItem.id,
          warehousePhotos,
          info
        );
        if (result.error) {
          setWarehouseError(result.error);
        } else {
          // Update local commande in list
          setItems((prev) =>
            prev.map((item) =>
              item.id === activeItem.id
                ? { ...item, warehouse_info: info, statut: "Entrepot" }
                : item
            )
          );
          // Update activeItem for drawer UI
          setActiveItem((prev) =>
            prev ? { ...prev, warehouse_info: info, statut: "Entrepot" } : prev
          );
          setOpenWarehouseDialog(false);
          setWarehousePrice("");
          setWarehouseWeight("");
          setWarehouseTransportType("");
          setWarehousePhotos([]);
        }
      }
    } catch (err: any) {
      setWarehouseError(err.message || "Erreur inconnue");
    } finally {
      setWarehouseLoading(false);
    }
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
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
  const [selectedRefundArticles, setSelectedRefundArticles] = useState<
    number[]
  >([]);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundCurrency, setRefundCurrency] = useState<string>("XOF");
  const [blockingCommandeId, setBlockingCommandeId] = useState<number | null>(
    null
  );
  const [localBlockedItems, setLocalBlockedItems] = useState<{
    [key: number]: { email: string; name?: string };
  }>({});
  const [isBlocking, setIsBlocking] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [invalidateDialogOpen, setInvalidateDialogOpen] = useState(false);
  const [walletUser, setWalletUser] = useState<any>(null);

  // Mettre à jour les items quand initialItems change, en préservant les modifications locales
  useEffect(() => {
    setItems((currentItems) => {
      // Si c'est la première fois ou si la longueur a changé, utiliser initialItems
      if (
        currentItems.length === 0 ||
        currentItems.length !== initialItems.length
      ) {
        return initialItems;
      }

      // Sinon, fusionner les états en préservant les modifications locales
      return initialItems.map((initialItem) => {
        const currentItem = currentItems.find(
          (item) => item.id === initialItem.id
        );

        // Si l'item a été modifié localement (blocage/déblocage), garder l'état local
        if (
          currentItem &&
          (currentItem.validationPending !== initialItem.validationPending ||
            currentItem.mail_valideur !== initialItem.mail_valideur)
        ) {
          console.log(
            `🔄 Préservation de l'état local pour la commande ${initialItem.id}`
          );
          return currentItem;
        }

        // Sinon, utiliser l'état du parent
        return initialItem;
      });
    });
  }, [initialItems]);

  // Récupérer l'utilisateur connecté et son solde
  useEffect(() => {
    const user = getSupabaseUser();
    setCurrentUser(user);

    console.log(`👤 Utilisateur connecté: ${user?.email || "Aucun"}`);
  }, []);

  // Récupérer le wallet de l'utilisateur connecté
  useEffect(() => {
    async function fetchWallet() {
      if (currentUser?.id) {
        const wallet = await getWalletByUserId(currentUser.id);
        setWalletUser(wallet);
      } else {
        setWalletUser(null);
      }
    }
    fetchWallet();
  }, [currentUser]);

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

    // Mettre à jour l'état des items IMMÉDIATEMENT pour un feedback instantané
    const updatedItem = items.find((item) => item.id === commandeId);
    if (updatedItem) {
      const newUpdatedItem = {
        ...updatedItem,
        validationPending: true,
        mail_valideur: currentUser.email,
      };

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === commandeId ? newUpdatedItem : item
        )
      );

      // Mettre à jour activeItem si c'est la commande en cours
      if (activeItem && activeItem.id === commandeId) {
        setActiveItem(newUpdatedItem);
      }

      // Notifier le parent IMMÉDIATEMENT
      if (onItemUpdate) {
        onItemUpdate(newUpdatedItem);
      }
    }

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

      // Rafraîchir les données pour synchroniser avec le serveur
      await updateStats();
    } catch (error) {
      console.error("Erreur lors du blocage de la commande:", error);

      // En cas d'erreur, restaurer tous les états
      const restoredItem = items.find((item) => item.id === commandeId);
      if (restoredItem) {
        const restoredUpdatedItem = {
          ...restoredItem,
          validationPending: false,
          mail_valideur: null,
        };

        // Restaurer l'état des items
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === commandeId ? restoredUpdatedItem : item
          )
        );

        // Restaurer activeItem si c'est la commande en cours
        if (activeItem && activeItem.id === commandeId) {
          setActiveItem(restoredUpdatedItem);
        }

        // Notifier le parent de la restauration
        if (onItemUpdate) {
          onItemUpdate(restoredUpdatedItem);
        }
      }

      // Restaurer l'état local des blocages
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

  // NOUVELLE fonction pour débloquer un bouton - Logique complètement refaite
  const unblockButton = async (commandeId: number) => {
    if (!currentUser) {
      console.error("Utilisateur non connecté");
      return;
    }

    console.log(
      `🔓 Début du déblocage pour la commande ${commandeId} par ${currentUser.email}`
    );

    setBlockingCommandeId(commandeId); // Démarrer le loader

    // Mettre à jour l'état local IMMÉDIATEMENT pour un feedback instantané
    const updatedItem = items.find((item) => item.id === commandeId);
    if (updatedItem) {
      const newUpdatedItem = {
        ...updatedItem,
        validationPending: false,
        mail_valideur: null,
      };

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === commandeId ? newUpdatedItem : item
        )
      );

      // Mettre à jour activeItem si c'est la commande en cours
      if (activeItem && activeItem.id === commandeId) {
        setActiveItem(newUpdatedItem);
      }

      // Notifier le parent IMMÉDIATEMENT
      if (onItemUpdate) {
        onItemUpdate(newUpdatedItem);
      }
    }

    // Mettre à jour l'état local des blocages
    setLocalBlockedItems((prev) => {
      const newState = { ...prev };
      delete newState[commandeId];
      console.log("🗑️ Suppression de l'état local pour", commandeId);
      return newState;
    });

    // Supprimer du localStorage
    localStorage.removeItem(`blockedButton_${commandeId}`);
    console.log("🗑️ Suppression du localStorage pour", commandeId);

    try {
      // Appeler la nouvelle fonction API de déblocage
      const result = await unblockValidationStatus(
        commandeId,
        currentUser.email
      );

      if (!result.success) {
        console.error("Erreur lors du déblocage:", result.error);
        // En cas d'erreur, on va restaurer l'état dans le catch
        throw new Error(result.error);
      }

      console.log("✅ Déblocage réussi dans la DB");

      // Rafraîchir les données pour synchroniser avec le serveur
      await updateStats();
      console.log("🔄 Stats mises à jour");
    } catch (error) {
      console.error("❌ Erreur lors du déblocage de la commande:", error);

      // En cas d'erreur, restaurer tous les états
      const restoredItem = items.find((item) => item.id === commandeId);
      if (restoredItem) {
        const restoredUpdatedItem = {
          ...restoredItem,
          validationPending: true,
          mail_valideur: currentUser.email,
        };

        // Restaurer l'état des items
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === commandeId ? restoredUpdatedItem : item
          )
        );

        // Restaurer activeItem si c'est la commande en cours
        if (activeItem && activeItem.id === commandeId) {
          setActiveItem(restoredUpdatedItem);
        }

        // Notifier le parent de la restauration
        if (onItemUpdate) {
          onItemUpdate(restoredUpdatedItem);
        }
      }

      // Restaurer l'état local des blocages
      setLocalBlockedItems((prev) => ({
        ...prev,
        [commandeId]: {
          email: currentUser.email,
          name: currentUser.user_metadata?.name || currentUser.email,
        },
      }));

      // Restaurer le localStorage
      localStorage.setItem(
        `blockedButton_${commandeId}`,
        JSON.stringify({
          email: currentUser.email,
          name: currentUser.user_metadata?.name || currentUser.email,
        })
      );

      alert("Erreur lors du déblocage. Veuillez réessayer.");
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

  const handleOpenDrawer = useCallback(
    (item: Commande) => {
      setActiveItem(item);
      setDrawerOpen(true);
    },
    [setActiveItem, setDrawerOpen]
  );

  const handleRefund = useCallback(async () => {
    if (!activeItem || !currentUser) {
      console.error("Aucune commande active ou utilisateur non connecté");
      return false;
    }

    if (selectedRefundArticles.length === 0) {
      alert("Veuillez sélectionner au moins un article à rembourser");
      return false;
    }

    try {
      console.log("🔄 Début du processus de remboursement", {
        commandeId: activeItem.id,
        selectedArticles: selectedRefundArticles.length,
        refundAmount,
        refundCurrency,
        paymentMethod: refundPaymentMethod,
      });

      // 1. Récupérer les articles à rembourser
      const articlesToRefund =
        activeItem.detail_commande?.articles?.filter((article) =>
          selectedRefundArticles.includes(article.id)
        ) || [];

      // 2. Calculer le montant réel à rembourser (95% du montant sélectionné)
      const actualRefundAmount = refundAmount * 0.95;

      // 3. Récupérer le wallet du client
      if (!activeItem.id_client) {
        throw new Error("ID du client non trouvé dans la commande");
      }

      // 4. Extraire la devise de la commande
      const commandeCurrency = extractCurrencyFromCommande(activeItem);

      // 5. Appeler la fonction de remboursement
      const result = await processRefund(
        activeItem.id, // orderId
        currentUser.id, // userId (celui qui traite le remboursement)
        null, // walletId du client
        articlesToRefund, // articles remboursés
        actualRefundAmount, // montant (95% du total)
        commandeCurrency // devise
      );

      console.log("✅ Remboursement traité avec succès:", result);

      // 6. Afficher le message de succès
      setShowRefundSuccess(true);

      // 7. Déclencher la mise à jour des stats
      if (updateStats) {
        await updateStats();
      }

      // 8. Déclencher la mise à jour des wallets
      triggerWalletRefresh(activeItem.id_client);

      // 9. Fermer le dialog après un court délai
      setTimeout(() => {
        setShowRefundSuccess(false);
      }, 3000);

      return true;
    } catch (error) {
      console.error("❌ Erreur lors du remboursement:", error);

      // Afficher une erreur spécifique à l'utilisateur
      const errorMessage = (error as any)?.message || "Erreur inconnue";
      if (errorMessage.includes("conversion")) {
        alert("❌ Erreur de conversion de devise. Veuillez réessayer.");
      } else if (errorMessage.includes("Session invalide")) {
        alert("❌ Session expirée. Veuillez vous reconnecter.");
      } else {
        alert(`❌ Erreur lors du remboursement: ${errorMessage}`);
      }

      return false;
    }
  }, [
    activeItem,
    currentUser,
    refundAmount,
    refundCurrency,
    refundPaymentMethod,
    selectedRefundArticles,
    updateStats,
  ]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setActiveItem(null);
    setIsRefundMode(false);
    setSelectedRefundArticles([]);
  }, []);

  const handleConfirmValidation = useCallback(
    async (completed: boolean) => {
      if (!activeItem) return;

      // Vérification du wallet utilisateur
      if (!walletUser || !walletUser.id) {
        alert("❌ Vous devez avoir un portefeuille pour valider une commande.");
        return;
      }

      if (!completed) {
        setConfirmDialogOpen(false);
        return;
      }

      try {
        setIsLoading(true);

        // Appel de validerCommande avec les bons paramètres
        const result = (await validerCommande(
          activeItem.id,
          currentUser?.email || undefined,
          currentUser?.id || undefined
        )) as any;
        if (result.error) {
          alert(`❌ Erreur: ${result.error}`);
          return;
        }
        if (result.message === "La commande est déjà validée") {
          console.log("La commande était déjà validée");
        }

        // Afficher des informations sur le paiement si traité
        if (result.paymentProcessed) {
          console.log("💳 Paiement de validation traité avec succès");
          if (result.walletBalance !== null) {
            // Déclencher la mise à jour du solde dans la navbar
            triggerWalletRefresh(currentUser?.id || "", result.walletBalance);
            console.log(
              `💰 Nouveau solde du portefeuille: ${result.walletBalance}`
            );
            // Notification à l'utilisateur
            alert(`✅ Paiement traité avec succès`);
          }
        } else {
          console.log("ℹ️ Aucun paiement traité pour cette validation");
        }

        // Créer la commande mise à jour avec les propriétés valides
        const updatedItem: Commande = {
          ...activeItem,
          validation_status: true,
          mail_valideur: currentUser?.email || null,
          validationPending: false,
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

        // Gestion d'erreurs spécifiques pour les problèmes de paiement
        const errorMessage =
          (error as any)?.message ||
          (typeof error === "object"
            ? JSON.stringify(error)
            : error?.toString()) ||
          "Erreur inconnue";

        if (errorMessage.includes("Solde insuffisant")) {
          alert(
            "❌ Solde insuffisant dans votre portefeuille pour valider cette commande. Veuillez recharger votre compte."
          );
        } else if (errorMessage.includes("Portefeuille non trouvé")) {
          alert(
            "❌ Erreur de portefeuille. Veuillez contacter l'administrateur."
          );
        } else if (
          errorMessage.includes("conversion") ||
          errorMessage.includes("devise")
        ) {
          alert(
            "❌ Erreur de conversion de devise. La validation sera tentée avec le montant original."
          );
        } else {
          alert(
            "❌ Erreur lors de la validation de la commande. Veuillez réessayer."
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeItem, onItemUpdate, currentUser, updateStats, walletUser]
  );

  const handleInvalidateCommande = useCallback(async () => {
    if (!activeItem) return;

    try {
      setIsInvalidating(true);

      const result = (await invalidateCommande(
        activeItem.id
      )) as InvalidateResult;

      if (result.error) {
        alert(`❌ Erreur: ${result.error}`);
        return;
      }

      if (result.success) {
        // Créer la commande mise à jour avec validation_status à false
        const updatedItem: Commande = {
          ...activeItem,
          validation_status: false,
          mail_valideur: null,
          validationPending: false,
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

        alert("✅ Commande dévalidée avec succès");

        // Fermer les modals
        setInvalidateDialogOpen(false);

        // Fermer le drawer après un court délai
        setTimeout(() => {
          setDrawerOpen(false);
          setActiveItem(null);
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur lors de la dévalidation:", error);
      alert("❌ Erreur lors de la dévalidation de la commande");
    } finally {
      setIsInvalidating(false);
    }
  }, [activeItem, onItemUpdate, updateStats]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  pb-80 gap-2 p-4 pt-0">
        {items.map((item) => (
          <Card className="w-full max-w-md mx-auto border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
            <CardHeader className="pb-3 px-3 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="text-foreground text-green-700 font-extrabold text-lg">
                    #{item.id}
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {item.detail_commande?.type || "Standard"}
                  </span>
                  {item.warehouse_info && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-300">
                      <svg
                        className="w-3 h-3 text-yellow-700"
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
                      Entrepôt traité
                    </span>
                  )}
                </CardTitle>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.validation_status
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
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
                  {new Date(item.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-0">
              <div className="w-full space-y-2">
                <div className="flex flex-col gap-2">
                  {!item.validation_status && (
                    <div>
                      {!item.validationPending ||
                      currentUser?.email === item.mail_valideur ? (
                        <button
                          onClick={() => handleOpenDrawer(item)}
                          className={`w-full ${
                            currentUser?.email === item.mail_valideur &&
                            item.validationPending
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "bg-[#0E7D0A] hover:bg-[#0E7D0A]/80"
                          } text-primary-foreground px-4 py-2 rounded-md text-sm font-bold transition-colors`}
                        >
                          {currentUser?.email === item.mail_valideur &&
                          item.validationPending
                            ? "Traiter la commande"
                            : "Valider la commande"}
                        </button>
                      ) : (
                        <div className="w-full bg-black/10 text-center text-foreground px-4 py-2 rounded-md text-sm mb-2">
                          <span className="font-bold">
                            En cours de traitement par {item.mail_valideur}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenDrawer(item)}
                    className={`w-full px-4 py-2 rounded-md text-sm font-bold transition-colors
                      ${
                        item.warehouse_info
                          ? "bg-blue-600 text-white hover:bg-blue-700 border border-blue-700"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }
                    `}
                  >
                    Voir les détails
                  </button>

                  {currentUser?.email === item.mail_valideur && (
                    <span className="text-xs text-muted-foreground font-bold text-center">
                      {item.validationPending ? "Bloqué par vous" : ""}
                    </span>
                  )}
                </div>
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
            PaperProps={{ sx: { width: isMobile ? "100%" : "83%" } }}
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
                {/* Affichage conditionnel : instructions ou infos entrepôt */}
                {activeItem?.warehouse_info ? (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow mb-6">
                    <h4 className="font-bold text-lg mb-2 text-blue-800 flex items-center gap-2">
                      <span className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        Entrepôt
                      </span>
                      Informations de traitement
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-blue-700">
                      <li>
                        <span className="font-semibold">Prix :</span>{" "}
                        {activeItem.warehouse_info.price} XOF
                      </li>
                      <li>
                        <span className="font-semibold">Poids :</span>{" "}
                        {activeItem.warehouse_info.weight} kg
                      </li>
                      <li>
                        <span className="font-semibold">
                          Type de transport :
                        </span>{" "}
                        {activeItem.warehouse_info.transport_type || "-"}
                      </li>
                      <li>
                        <span className="font-semibold">Annonce :</span>{" "}
                        {activeItem.annonce?.source} →{" "}
                        {activeItem.annonce?.destination} (
                        {activeItem.annonce?.type_transport || "-"})
                      </li>
                      {activeItem.annonce?.created_at && (
                        <li>
                          <span className="font-semibold">
                            Date de l'annonce :
                          </span>{" "}
                          {new Date(
                            activeItem.annonce.created_at
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </li>
                      )}
                      {activeItem.warehouse_info.photos &&
                        activeItem.warehouse_info.photos.length > 0 && (
                          <li>
                            <span className="font-semibold">Photos :</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {activeItem.warehouse_info.photos.map(
                                (url: string, idx: number) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => window.open(url, "_blank")}
                                    title="Cliquez pour agrandir"
                                  >
                                    <img
                                      src={url}
                                      alt={`Photo entrepôt ${idx + 1}`}
                                      className="w-16 h-16 object-cover rounded border hover:scale-105 transition-transform"
                                    />
                                  </button>
                                )
                              )}
                            </div>
                            <span className="text-xs text-blue-500 mt-1 block">
                              Cliquez sur une photo pour l'agrandir
                            </span>
                          </li>
                        )}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow mb-6">
                    <h4 className="font-bold text-lg mb-2 text-yellow-800 flex items-center gap-2">
                      <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                        Instructions
                      </span>
                      de validation
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                      <li>
                        Cliquez sur "Ouvrir le site" pour accéder au site
                        marchand
                      </li>
                      <li>Connectez-vous à votre compte si nécessaire</li>
                      <li>
                        Vérifiez les détails de la commande #{activeItem.id}
                      </li>
                      <li>Procédez à la validation sur le site</li>
                      <li>
                        Une fois terminé, revenez ici et cliquez sur "J'ai
                        validé"
                      </li>
                    </ol>
                  </div>
                )}
                {/* Indicateur entrepôt traité dans le drawer */}
                {activeItem?.warehouse_info && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow mb-6 flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-blue-700"
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
                    <div>
                      <h4 className="font-semibold text-blue-800">
                        Entrepôt déjà traité
                      </h4>
                      <p className="text-sm text-blue-700">
                        Cette commande a déjà été préparée en entrepôt.
                      </p>
                    </div>
                  </div>
                )}

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
                  {/* Préparation en Entrepôt */}
                  {activeItem?.validation_status &&
                    !activeItem?.warehouse_info && (
                      <Button
                        disabled={activeItem?.warehouse_info !== null}
                        className="bg-yellow-600 hover:bg-yellow-700 w-full md:w-auto"
                        onClick={() => setOpenWarehouseDialog(true)}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Préparation en Entrepôt
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
                        (isButtonBlocked(activeItem) &&
                          !canUnblockButton(activeItem)) ||
                        !walletUser ||
                        !walletUser.id
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
                      ) : !walletUser || !walletUser.id ? (
                        <span>Portefeuille requis</span>
                      ) : (
                        "J'ai validé"
                      )}
                    </Button>
                  )}

                  {/* {activeItem.validation_status && (
                    <Button
                      className="w-full md:w-auto bg-red-600 hover:bg-red-700"
                      onClick={() => setInvalidateDialogOpen(true)}
                      disabled={isInvalidating}
                    >
                      {isInvalidating ? (
                        <div className="flex items-center gap-2">
                          <BeatLoader color="#ffffff" size={8} />
                          <span>Dévalidation...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          <span>Dévalider</span>
                        </div>
                      )}
                    </Button>
                  )} */}
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
                    <h4 className="sm:block hidden font-semibold text-gray-700">
                      Colis
                    </h4>
                    {isRefundMode && selectedRefundArticles.length > 0 && (
                      <div className="border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex gap-3 items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {selectedRefundArticles.length} article(s)
                              sélectionné(s)
                            </span>
                            {/* Calcul de la somme totale à rembourser */}
                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                              Somme totale à rembourser :{" "}
                              {(() => {
                                const articles =
                                  activeItem?.detail_commande?.articles || [];
                                const total = articles
                                  .filter((art: any) =>
                                    selectedRefundArticles.includes(art.id)
                                  )
                                  .reduce(
                                    (sum: number, art: any) =>
                                      sum +
                                      (typeof art.totalPrice === "number"
                                        ? art.totalPrice
                                        : (art.price || 0) *
                                          (art.quantity || 1)),
                                    0
                                  );
                                let currency =
                                  activeItem?.detail_commande?.articles[0]
                                    ?.currency;
                                if (currency === "€" || currency === "EURO")
                                  currency = "EUR";
                                if (
                                  !currency ||
                                  typeof currency !== "string" ||
                                  currency.length !== 3
                                )
                                  currency = "XOF";
                                return `${total.toLocaleString("fr-FR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })} ${currency}`;
                              })()}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              // Logique de traitement du remboursement
                              console.log(
                                "Traitement du remboursement pour les articles:",
                                selectedRefundArticles
                              );
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
                    {/* <Button
                      size="sm"
                      variant={isRefundMode ? "default" : "outline"}
                      onClick={() => {
                        setSelectedRefundArticles([]);
                        setIsRefundMode(!isRefundMode);
                      }}
                      className={
                        isRefundMode
                          ? "bg-zinc-600 hover:bg-zinc-700 border-zinc-600 w-full md:w-auto md:mt-0 mt-2"
                          : "text-blue-600 border-blue-300 hover:bg-blue-50 w-full md:w-auto mt-2"
                      }
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
                    </Button> */}
                  </div>

                  {isRefundMode && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100 flex justify-between items-center">
                      <p className="text-sm text-blue-800">
                        Sélectionnez les articles à rembourser
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 text-blue-600 border-blue-300 hover:bg-blue-100"
                        onClick={() => {
                          const allArticleIds =
                            activeItem?.detail_commande?.articles?.map(
                              (art) => art.id
                            ) || [];
                          setSelectedRefundArticles((prev) =>
                            prev.length === allArticleIds.length
                              ? []
                              : allArticleIds
                          );
                        }}
                      >
                        {selectedRefundArticles.length ===
                        (activeItem?.detail_commande?.articles?.length || 0)
                          ? "Tout désélectionner"
                          : "Tout sélectionner"}
                      </Button>
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
                      const articles =
                        activeItem?.detail_commande?.articles || [];
                      const filtered = articles.filter((art: any) =>
                        selectedIds.includes(art.id)
                      );
                      const total = filtered.reduce(
                        (sum: number, art: any) =>
                          sum +
                          (typeof art.totalPrice === "number"
                            ? art.totalPrice
                            : (art.price || 0) * (art.quantity || 1)),
                        0
                      );
                      let currency =
                        filtered[0]?.currency || articles[0]?.currency;
                      if (currency === "€" || currency === "EURO")
                        currency = "EUR";
                      if (
                        !currency ||
                        typeof currency !== "string" ||
                        currency.length !== 3
                      )
                        currency = "XOF";
                      setRefundAmount(total);
                      setRefundCurrency(currency);
                      console.log("Articles sélectionnés:", selectedIds);
                    }}
                  />

                  {/* Dialog de préparation en entrepôt */}
                  <MuiDialog
                    open={openWarehouseDialog}
                    onClose={() => setOpenWarehouseDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ className: "rounded-2xl shadow-2xl" }}
                  >
                    <MuiDialogTitle className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-yellow-600"
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
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            Préparation en Entrepôt
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Renseignez les informations d'entrepôt
                          </p>
                        </div>
                      </div>
                    </MuiDialogTitle>
                    <MuiDialogContent className="px-6 py-4">
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prix
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={warehousePrice}
                              onChange={(e) => {
                                setWarehousePrice(e.target.value),
                                  setWarehouseTransportType(
                                    activeItem.annonce.type_transport
                                  );
                              }}
                              className="w-full border rounded px-3 py-2"
                              placeholder="Prix"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Poids (kg)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={warehouseWeight}
                              onChange={(e) =>
                                setWarehouseWeight(e.target.value)
                              }
                              className="w-full border rounded px-3 py-2"
                              placeholder="Poids"
                            />
                          </div>
                        </div>
                        {/*  <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type de transport
                          </label>
                          <select
                            value={warehouseTransportType}
                            onChange={(e) =>
                              setWarehouseTransportType(e.target.value)
                            }
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">Sélectionner</option>
                            {activeItem?.annonce?.type_transport && (
                              <option value={activeItem.annonce.type_transport}>
                                {activeItem.annonce.type_transport}
                              </option>
                            )}
                            <option value="express">Express</option>
                            <option value="standard">Standard</option>
                          </select>
                        </div> */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photos de la commande
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              setWarehousePhotos(
                                e.target.files ? Array.from(e.target.files) : []
                              )
                            }
                            className="w-full"
                          />
                          <div className="flex flex-wrap gap-2 mt-2">
                            {warehousePhotos &&
                              warehousePhotos.length > 0 &&
                              warehousePhotos.map((file, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gray-100 px-2 py-1 rounded text-xs"
                                >
                                  {file.name}
                                </span>
                              ))}
                          </div>
                        </div>
                        {warehouseError && (
                          <div className="text-red-600 text-sm mt-2">
                            {warehouseError}
                          </div>
                        )}
                      </div>
                    </MuiDialogContent>
                    <MuiDialogActions className="grid grid-cols-2 px-6 py-4 bg-gray-50 rounded-b-2xl">
                      <Button
                        variant="outline"
                        onClick={() => setOpenWarehouseDialog(false)}
                        disabled={warehouseLoading}
                      >
                        Annuler
                      </Button>
                      <Button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={handleWarehouseSubmit}
                        disabled={warehouseLoading}
                      >
                        {warehouseLoading ? "Enregistrement..." : "Confirmer"}
                      </Button>
                    </MuiDialogActions>
                  </MuiDialog>
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
              className: "rounded-2xl shadow-2xl",
            }}
          >
            <MuiDialogTitle className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Remboursement client
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Sélectionnez le mode de paiement
                  </p>
                </div>
              </div>
            </MuiDialogTitle>

            <MuiDialogContent className="px-6 py-4">
              <div className="space-y-6">
                {/* Informations client */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium text-blue-900">
                      Numéro de téléphone du client
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-blue-900 font-medium text-lg">
                        {activeItem?.client?.Tel || "Non renseigné"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Montant du remboursement */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <span className="font-medium text-green-900">
                      Détails du remboursement
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Montant total sélectionné :
                      </span>
                      <span className="font-medium">
                        {refundAmount.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {refundCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Montant remboursé (95%) :
                      </span>
                      <span className="font-bold text-green-700">
                        {(refundAmount * 0.95).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {refundCurrency}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-green-100 text-sm text-green-700">
                      <p>Le client recevra 95% du montant total sélectionné.</p>
                      <p className="text-xs text-green-600 mt-1">
                        (5% sont retenus pour les frais de service)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modes de paiement */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900 mb-4">
                    Mode de paiement
                  </label>

                  <div className="space-y-2">
                    {/* Wave */}
                    <label
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        refundPaymentMethod === "wave"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="refundPayment"
                        value="wave"
                        checked={refundPaymentMethod === "wave"}
                        onChange={() => setRefundPaymentMethod("wave")}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            W
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Wave
                          </span>
                          <p className="text-sm text-gray-500">
                            Paiement mobile Wave
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Orange Money */}
                    <label
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        refundPaymentMethod === "orange"
                          ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="refundPayment"
                        value="orange"
                        checked={refundPaymentMethod === "orange"}
                        onChange={() => setRefundPaymentMethod("orange")}
                        className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <div className="ml-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            OM
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Orange Money
                          </span>
                          <p className="text-sm text-gray-500">
                            Paiement mobile Orange
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Carte bancaire */}
                    <label
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        refundPaymentMethod === "cb"
                          ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="refundPayment"
                        value="cb"
                        checked={refundPaymentMethod === "cb"}
                        onChange={() => setRefundPaymentMethod("cb")}
                        className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <div className="ml-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Carte bancaire
                          </span>
                          <p className="text-sm text-gray-500">
                            Remboursement sur carte
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Message d'information */}
                {refundPaymentMethod && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-amber-800 font-medium">
                          Information importante
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          {refundPaymentMethod === "wave" &&
                            "Le remboursement sera effectué sur le compte Wave du client sous 1-2 minutes."}
                          {refundPaymentMethod === "orange" &&
                            "Le remboursement sera effectué sur le compte Orange Money du client sous 1-2 minutes."}
                          {refundPaymentMethod === "cb" &&
                            "Le remboursement sera effectué sur la carte bancaire sous 3-5 jours ouvrés."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </MuiDialogContent>

            <MuiDialogActions className="grid grid-cols-1 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-500 mb-1">
                Montant à envoyer:{" "}
                <span className="font-semibold">
                  {(refundAmount * 0.95).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {refundCurrency}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setOpenRefundDialog(false)}
                className="border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  handleRefund();
                  setOpenRefundDialog(false);
                  setShowRefundSuccess(true);
                  // Réinitialiser la sélection après traitement
                  setSelectedRefundArticles([]);
                  setIsRefundMode(false);
                  setRefundPaymentMethod("");
                }}
                disabled={!refundPaymentMethod}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirmer
              </Button>
            </MuiDialogActions>
          </MuiDialog>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              // Logique de traitement du remboursement
              console.log(
                "Traitement du remboursement pour les articles:",
                selectedRefundArticles
              );
              // Réinitialiser la sélection après traitement
              setSelectedRefundArticles([]);
              setIsRefundMode(false);
              setOpenRefundDialog(true);
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Valider
          </Button>
          {showRefundSuccess && (
            <div
              className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in"
              style={{ minWidth: 250, textAlign: "center" }}
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
            {/* <MuiDialogTitle className="text-lg font-semibold">
              Confirmation de validation
            </MuiDialogTitle> */}
            <MuiDialogContent>
              <div className="space-y-4">
                <p className="font-semibold text-gray-800">
                  Avez-vous validé la commande #{activeItem?.id} sur le site
                  externe ?
                </p>

                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-semibold text-green-800 mb-2">
                    💰 Montant à débiter :
                  </h4>
                  <p className="text-sm font-semibold text-green-700">
                    {activeItem?.total_price?.slice(0, 8)}{" "}
                    {activeItem?.detail_commande?.articles[0]?.currency}
                    {activeItem?.detail_commande?.articles[0]?.currency !==
                      "XOF" && " (converti automatiquement en XOF)"}
                  </p>
                </div>
                {/* <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    📋 Processus de validation :
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Validation de la commande sur le site externe</li>
                    <li>• Débit automatique de votre portefeuille</li>
                    <li>
                      • Création d'une transaction en attente (status: pending)
                    </li>
                  </ul>
                </div> */}

                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                  <h4 className="font-semibold text-orange-800 mb-2">
                    ⚠️ Étapes suivantes :
                  </h4>
                  <ol className="text-sm text-orange-700 space-y-1">
                    <li>
                      1. Rendez-vous dans la section <strong>Finance</strong>
                    </li>
                    <li>2. Trouvez votre transaction (status: En attente)</li>
                    <li>
                      3. Uploadez la preuve de paiement (photo/capture d'écran)
                    </li>
                    <li>
                      4. La transaction passera au status{" "}
                      <strong>Confirmé</strong>
                    </li>
                  </ol>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <p className="text-sm text-red-700">
                    <strong>Important :</strong> Cette action débitera
                    immédiatement votre portefeuille. La transaction sera en
                    attente jusqu'à l'upload de la preuve de paiement.
                  </p>
                </div>
              </div>
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
                  "Oui, j'ai validé"
                )}
              </Button>
            </MuiDialogActions>
          </MuiDialog>

          <MuiDialog
            open={invalidateDialogOpen}
            onClose={() => setInvalidateDialogOpen(false)}
          >
            <MuiDialogTitle className="pb-2 text-red-700">
              Confirmation de dévalidation
            </MuiDialogTitle>
            <MuiDialogContent className="px-6 py-4">
              <p className="text-base text-gray-700">
                Êtes-vous sûr de vouloir <b>dévalider</b> cette commande ?<br />
                Cette action va remettre la commande en statut non validé.
              </p>
            </MuiDialogContent>
            <MuiDialogActions className="grid grid-cols-2 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={() => setInvalidateDialogOpen(false)}
                disabled={isInvalidating}
              >
                Annuler
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleInvalidateCommande}
                disabled={isInvalidating}
              >
                {isInvalidating
                  ? "Dévalidation..."
                  : "Confirmer la dévalidation"}
              </Button>
            </MuiDialogActions>
          </MuiDialog>
        </>
      )}
    </ScrollArea>
  );
}
