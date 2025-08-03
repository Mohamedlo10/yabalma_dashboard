import { formatDistanceToNow } from "date-fns";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { FaArrowRight } from "react-icons/fa";
import { Commande } from "../schema";
import { useCommande } from "../use-commande";
import React, { useState } from "react";
import PersonalInfo from "@/app/dashboard/commandes/profile/personalInfo";
import ColisInfo from "@/app/dashboard/commandes/profile/colisInfo/colisInfo";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Truck,
  BadgeCheck,
  BadgeX,
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface commandeListProps {
  items: Commande[];
}

// Composant simplifié pour les détails de commande
function SimpleCommandeDetails({ commande }: { commande: Commande }) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard/commandes/profile?id=${commande.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
      {/* En-tête */}
      <div className="flex items-center gap-2 sm:gap-3 border-b pb-2 sm:pb-3 mb-3">
        <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
        <div className="font-bold text-sm sm:text-base text-red-700">
          {commande.client?.prenom} {commande.client?.nom}
        </div>
        <span className="ml-auto px-2 py-1 rounded text-xs sm:text-sm font-semibold bg-gray-100 text-gray-700">
          ID: {commande.id}
        </span>
      </div>

      {/* Informations de contact */}
      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
          {commande.client?.Tel}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          Créée :{" "}
          {commande.created_at
            ? new Date(commande.created_at).toLocaleDateString("fr-FR")
            : "-"}
        </div>
      </div>

      {/* Cartes d'information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
        <div className="bg-gray-50 rounded p-2 sm:p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1 font-semibold text-xs sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" /> Départ
          </div>
          <div className="text-xs sm:text-sm">
            {commande?.annonce?.source} {commande?.annonce?.sourceAddress}
          </div>
          <div className="text-xs text-gray-500">
            {commande?.annonce?.date_depart
              ? new Date(commande.annonce.date_depart).toLocaleDateString(
                  "fr-FR"
                )
              : "-"}
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2 sm:p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1 font-semibold text-xs sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" /> Destination
          </div>
          <div className="text-xs sm:text-sm">
            {commande?.annonce?.destination}{" "}
            {commande?.annonce?.destinationAddress}
          </div>
          <div className="text-xs text-gray-500">
            {commande?.annonce?.date_arrive
              ? new Date(commande.annonce.date_arrive).toLocaleDateString(
                  "fr-FR"
                )
              : "-"}
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2 sm:p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1 font-semibold text-xs sm:text-sm">
            <Truck className="w-3 h-3 sm:w-4 sm:h-4" /> Transport
          </div>
          <div className="text-xs sm:text-sm">
            {commande?.annonce?.type_transport}
          </div>
        </div>
      </div>

      {/* Détails de la commande avec bouton */}
      <div className="bg-blue-50 rounded p-2 sm:p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-xs sm:text-sm text-blue-800">
            Détails de la commande
          </div>
          <Button
            onClick={handleViewDetails}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-xs sm:text-sm h-6 sm:h-7 px-2 sm:px-3"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            Voir Détails
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type :</span>
            <span className="font-medium">
              {commande?.detail_commande?.type || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nombre d'articles :</span>
            <span className="font-medium">
              {commande?.detail_commande?.articles?.length || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Prix total :</span>
            <span className="font-medium text-green-600">
              {commande?.total_price || "N/A"}{" "}
              {commande?.detail_commande?.articles?.[0]?.currency || ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Destinataire :</span>
            <span className="font-medium">
              {commande?.detail_commande?.first_name || "N/A"}
            </span>
          </div>
          <div className="flex justify-between sm:col-span-2">
            <span className="text-gray-600">Téléphone destinataire :</span>
            <span className="font-medium">
              {commande?.detail_commande?.destinataire_number || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Statuts */}
      <div className="flex flex-wrap gap-1 sm:gap-2">
        <span
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-semibold ${
            commande.validation_status
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {commande.validation_status ? (
            <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <BadgeX className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          {commande.validation_status ? "Validée" : "Non validée"}
        </span>
        <span
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-semibold ${
            commande.payment_status === "paid"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
          {commande.payment_status === "paid" ? "Payée" : "Non payée"}
        </span>
        <span
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-semibold ${
            commande.cancelled_status
              ? "bg-gray-300 text-gray-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {commande.cancelled_status ? (
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          {commande.cancelled_status ? "Annulée" : "Active"}
        </span>
      </div>
    </div>
  );
}

export function CommandeList({ items }: commandeListProps) {
  const [commande, setCommande] = useCommande();
  const [lastSelected, setLastSelected] = useState<number | null>(null);

  const handleSelect = (item: Commande) => {
    setLastSelected(commande.selected);
    setCommande({ ...commande, selected: item.id });
  };

  // Trouver la commande sélectionnée
  const selectedCommande = items.find((item) => item.id === commande.selected);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 lg:p-8">
        <img
          src="/empty-state.svg"
          width={100}
          height={100}
          alt="Aucune commande"
          className="mb-3 sm:mb-4 lg:mb-6"
        />
        <div className="text-base sm:text-lg lg:text-xl font-semibold mb-2">
          Aucune commande trouvée
        </div>
        <div className="text-gray-500 mb-3 sm:mb-4 lg:mb-6 text-center text-xs sm:text-sm lg:text-base">
          Essayez de modifier vos filtres ou créez une nouvelle commande.
        </div>
        <button className="bg-red-600 text-white px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-lg shadow hover:bg-red-700 transition text-xs sm:text-sm lg:text-base">
          Créer une commande
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-fit h-full min-h-0">
      {/* Liste des commandes à gauche */}
      <div className="w-full md:w-[60%] border-r h-full min-h-0 flex flex-col">
        <ScrollArea className="flex-1 h-full max-h-[70vh] sm:max-h-[75vh] lg:max-h-[80vh] xl:max-h-[85vh] overflow-y-auto min-h-0">
          <div className="flex flex-col gap-1.5 sm:gap-2 lg:gap-3 p-1.5 sm:p-2 lg:p-3 pt-1.5 sm:pt-2 lg:pt-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative group bg-white shadow rounded-lg border p-1.5 sm:p-2 lg:p-3 flex flex-col gap-1 sm:gap-1.5 lg:gap-2 transition-all hover:shadow-lg cursor-pointer",
                  commande.selected === item.id &&
                    "ring-2 ring-red-600 border-red-600"
                )}
                tabIndex={0}
                aria-selected={commande.selected === item.id}
                onClick={() => handleSelect(item)}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12">
                    <AvatarImage
                      src={item.client?.img_url || "/avatar-default.svg"}
                      className="rounded-full object-cover w-full h-full"
                      alt="Avatar"
                    />
                    <AvatarFallback className="text-xs sm:text-sm lg:text-base xl:text-lg flex items-center justify-center">
                      {item.client?.prenom?.[0] || ""}
                      {item.client?.nom?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-red-700 text-xs sm:text-sm lg:text-base truncate">
                      {item.client?.prenom} {item.client?.nom}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.client?.Tel}
                    </div>
                  </div>
                  <span
                    className={`px-1 sm:px-1.5 lg:px-2 py-0.5 sm:py-1 lg:py-1.5 rounded text-xs font-semibold flex-shrink-0 ${
                      item.statut === "Livré"
                        ? "bg-green-100 text-green-700"
                        : item.statut === "Annulé"
                        ? "bg-gray-200 text-gray-500"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.statut || "En cours"}
                  </span>
                  <div className="flex gap-0.5 sm:gap-1 ml-0.5 sm:ml-1 lg:ml-2 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-0.5 sm:p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                      <FaArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Informations de la commande */}
                <div className="mt-1 sm:mt-1.5 lg:mt-2 space-y-0.5 sm:space-y-1 lg:space-y-1.5">
                  <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-xs sm:text-sm">
                    <span className="bg-yellow-100 text-yellow-700 px-1 sm:px-1.5 lg:px-2 py-0.5 rounded text-xs font-medium">
                      {item.annonce?.type_transport || "Entrepot"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-xs sm:text-sm lg:text-base text-gray-600">
                    <span className="font-medium">
                      {item.annonce?.source} → {item.annonce?.destination}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      <span>
                        Créée : {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      <span>
                        Départ :{" "}
                        {new Date(
                          item.annonce?.date_depart || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      <span>
                        Arrivée :{" "}
                        {new Date(
                          item.annonce?.date_arrive || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-0.5 sm:gap-1 lg:gap-1.5 mt-0.5 sm:mt-1 lg:mt-1.5">
                    <span
                      className={`px-1 sm:px-1.5 lg:px-2 py-0.5 rounded text-xs font-medium ${
                        item.validation_status
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.validation_status ? "Validé" : "Non validé"}
                    </span>
                    <span
                      className={`px-1 sm:px-1.5 lg:px-2 py-0.5 rounded text-xs font-medium ${
                        item.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.payment_status === "paid" ? "Payé" : "Non payé"}
                    </span>
                    <span className="px-1 sm:px-1.5 lg:px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      ID: {item.id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Détails de la commande à droite */}
      <div className="hidden md:flex md:w-[40%] h-full max-h-[70vh] sm:max-h-[75vh] lg:max-h-[80vh] xl:max-h-[85vh] overflow-y-auto min-h-0 flex-col">
        <AnimatePresence mode="wait">
          {commande.selected && selectedCommande ? (
            <motion.div
              key={commande.selected}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 h-full p-2 sm:p-3 lg:p-4"
            >
              <SimpleCommandeDetails commande={selectedCommande} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 h-full flex items-center justify-center bg-gray-50"
            >
              <div className="text-center p-4 sm:p-6 lg:p-8">
                <div className="text-gray-400 mb-3 sm:mb-4 lg:mb-6">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-600 mb-1.5 sm:mb-2 lg:mb-3">
                  Sélectionnez une commande
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm lg:text-base">
                  Choisissez une commande dans la liste pour voir les détails
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
