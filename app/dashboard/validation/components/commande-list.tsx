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
}
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import { validerCommande } from "@/app/api/commandes/query";
import Drawer from "@mui/material/Drawer";
import ArticlesList from "@/components/ui/article/article-list";
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
export function CommandeList({ items }: commandeListProps) {
  const [commande, setCommande] = useCommande();
  const [isLoading, setIsLoading] = useState(false);
  const [color] = useState("#ffffff");
  const [_, updateStats] = useUpdateStats();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Commande | null>(null);

  const handleOpenDrawer = (item: Commande) => {
    setActiveItem(item);
    setDrawerOpen(true);

    // Si vous avez déjà ouvert le site dans un autre onglet, vous pouvez le noter
    localStorage.setItem("lastViewedOrder", item.id.toString());
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleConfirmValidation = (isValidated: boolean) => {
    setConfirmDialogOpen(false);

    if (isValidated && activeItem) {
      ConfirmerCommande(activeItem.id);
    }
  };

  const ConfirmerCommande = async (id: number) => {
    setIsLoading(true);
    try {
      if (id) {
        const response = await validerCommande(id);
        console.log("Confirmation reussi", response);
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

  if (items.length === 0) {
    return (
      <div className="text-xl items-center justify-center text-secondary-foreground flex w-full h-full mt-12">
        Aucun resultat
      </div>
    );
  }

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
              {/* Section Ctext-lient */}
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

            <CardFooter className="flex justify-between gap-4 p-4 bg-gray-50 border-t">
              {!item.validation_status && (
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleOpenDrawer(item)}
                >
                  Valider cette commande
                </Button>
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
                <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
                  {(activeItem.shop?.url ||
                    activeItem.detail_commande?.whatsapp) && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                      onClick={() => {
                        const url =
                          activeItem.shop?.url ||
                          activeItem.detail_commande?.whatsapp;
                        window.open(url, "_blank");
                      }}
                    >
                      Ouvrir le site
                    </Button>
                  )}
                  <Button
                    className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    J'ai validé
                  </Button>
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
