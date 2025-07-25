import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { format } from "date-fns";
import { MoreVertical, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { type Commande } from "../schema";

interface CommandeDisplayProps {
  commande: Commande | null;
}

export function CommandeDisplay({ commande }: CommandeDisplayProps) {
  const today = new Date();
  const router = useRouter();
  const handleNavigation = (idCommande: number) => {
    router.push(`/dashboard/commandes/profile?id=${idCommande}`);
  };
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center py-2 px-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-row text-sm  items-center justify-center gap-3">
            <div className="  text-muted-foreground">Commande de </div>
            <div className=" text-red-700 ">
              {commande?.client?.prenom} {commande?.client?.nom}
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2"></div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!commande}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {commande ? (
        <div className="flex flex-1 flex-col max-h-[84vh] overflow-y-auto items-center ">
          <div className="flex w-full max-w-xl flex-col items-center bg-white p-2 text-left rounded-lg shadow-lg mt-4">
            <div className="flex xl:flex-row flex-col gap-2 w-full ">
              <div className="flex flex-col w-full items-center gap-2 ">
                <div className="mb-2 text-sm leading-none">Client</div>
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={commande.client?.img_url || "/avatar-default.svg"}
                    className="rounded-full object-cover w-full h-full"
                    alt="Avatar"
                  />
                  <AvatarFallback className="text-xl flex items-center justify-center">
                    {commande.client?.prenom?.[0] || ""}
                    {commande.client?.nom?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm leading-none text-red-700">
                    {commande.client?.prenom} {commande.client?.nom}
                  </p>
                </div>
                <div className="line-clamp-2 flex flex-row gap-2 text-sm text-muted-foreground">
                  <Phone /> {commande.client?.Tel}
                </div>
              </div>
              <div className="flex flex-col w-full items-center gap-2 ">
                <div className="mb-2 text-sm leading-none">GP</div>
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      commande.annonce?.client?.img_url || "/avatar-default.svg"
                    }
                    className="rounded-full object-cover w-full h-full"
                    alt="Avatar"
                  />
                  <AvatarFallback className="text-xl flex items-center justify-center">
                    {commande.annonce?.client?.prenom?.[0] || ""}
                    {commande.annonce?.client?.nom?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm leading-none text-red-700">
                    {commande.annonce?.client?.prenom}{" "}
                    {commande.annonce?.client?.nom}
                  </p>
                </div>
                <div className="line-clamp-2 flex flex-row gap-2 text-sm text-muted-foreground">
                  <Phone /> {commande.annonce?.client?.Tel}
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full gap-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>{commande.annonce?.source}</span>
                <span>→</span>
                <span>{commande.annonce?.destination}</span>
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                <span
                  className={`px-2 py-1 rounded ${
                    commande.validation_status
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {commande.validation_status ? "Validé" : "Non validé"}
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    commande.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {commande.payment_status === "paid" ? "Payé" : "Non payé"}
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    commande.statut === "Livré"
                      ? "bg-green-100 text-green-700"
                      : commande.statut === "Annulé"
                      ? "bg-gray-200 text-gray-500"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {commande.statut || "En cours"}
                </span>
              </div>
              <div className="w-full border-l-4 border-red-600 pl-4 mt-4">
                <div className="font-semibold mb-1">Timeline</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>
                    Créée le{" "}
                    {commande.created_at &&
                      new Date(commande.created_at).toLocaleDateString("fr-FR")}
                  </li>
                  <li>
                    Départ prévu le{" "}
                    {commande.annonce?.date_depart &&
                      new Date(commande.annonce.date_depart).toLocaleDateString(
                        "fr-FR"
                      )}
                  </li>
                  <li>
                    Arrivée prévue le{" "}
                    {commande.annonce?.date_arrive &&
                      new Date(commande.annonce.date_arrive).toLocaleDateString(
                        "fr-FR"
                      )}
                  </li>
                  <li>
                    Statut actuel :{" "}
                    <span className="font-bold">
                      {commande.statut || "En cours"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="ml-auto pt-4 w-full items-center justify-center flex font-medium gap-2">
              <Button
                onClick={() => handleNavigation(commande.id)}
                className="w-fit h-10"
              >
                Voir Détails
              </Button>
              <Button variant="outline" className="w-fit h-10">
                Éditer
              </Button>
              <Button variant="destructive" className="w-fit h-10">
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center p-8 text-center text-xl text-muted-foreground">
          Aucune commande selectionnée
        </div>
      )}
    </div>
  );
}
