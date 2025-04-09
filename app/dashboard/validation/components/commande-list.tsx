import { formatDistanceToNow } from "date-fns";

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
    <ScrollArea className="h-screen ">
      <div className="flex flex-col pb-80 gap-2 p-4 pt-0 ">
        {items.map((item) => (
          <Card className="w-full max-w-2xl mx-auto shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="md:text-lg text-sm font-semibold text-gray-800">
                Commande #{item.id}
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
                    <p className="text-xs md:text-sm text-gray-500">Nom</p>
                    <p className="font-medium text-xs md:text-base">
                      {item.client?.nom}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Prenom</p>
                    <p className="font-medium text-xs md:text-base">
                      {item.client?.prenom}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Téléphone
                    </p>
                    <p className="font-medium text-xs md:text-base">
                      {item.client?.Tel}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Adresse</p>
                    <p className="font-medium text-xs md:text-base">
                      {item.client?.Pays} {item.client?.ville}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Prestataire */}
              <div className="p-4 border-b">
                <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-2">
                  Prestataire de Service
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Nom</p>
                    <p className="font-medium text-xs md:text-base">
                      {item.annonce?.client?.nom}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Prenom</p>
                    <p className="font-medium text-xs md:text-base">
                      {item.annonce?.client?.prenom}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Adresse</p>
                    <div className="flex items-center">
                      <span className="font-medium text-xs md:text-base">
                        {item.annonce?.client?.Pays}{" "}
                        {item.annonce?.client?.ville}
                      </span>
                      <svg
                        className="w-4 h-4 text-yellow-400 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Contact</p>
                    <p className="font-medium text-xs md:text-base">
                      {item.annonce?.client?.Tel}
                    </p>
                  </div>
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
                    <p className="font-medium text-xs md:text-base">
                      {format(
                        new Date(item.annonce.created_at),
                        "dd MMMM yyyy",
                        {
                          locale: fr,
                        }
                      )}
                      {" à "}
                      {format(new Date(item.annonce.created_at), "mm:ss", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Trajet</p>
                    <p className="font-medium text-xs md:text-base">
                      {item.annonce.source} - {item.annonce.destination}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Statut</p>

                    <span
                      className={`inline-flex items-center p-2 rounded-md  font-medium text-xs md:text-base ${
                        !item.validation_status
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-900"
                      }`}
                    >
                      {item.validation_status ? "Validé" : "Non validé"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Prix</p>
                    <p className="font-medium text-xs md:text-lg ">
                      {item.total_price}{" "}
                      {item.detail_commande?.articles[0].currency}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between gap-4 p-4 bg-gray-50 border-t">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleNavigation(item.id)}
              >
                <Eye size={16} />
                Voir Détails
              </Button>
              {!item.validation_status && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    ConfirmerCommande(item.id).then((success) => {
                      if (success) {
                        item.validation_status = true;
                      }
                    });
                  }}
                >
                  Valider
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
