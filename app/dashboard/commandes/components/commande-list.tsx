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
import { Calendar, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface commandeListProps {
  items: Commande[];
}

export function CommandeList({ items }: commandeListProps) {
  const [commande, setCommande] = useCommande();
  const [lastSelected, setLastSelected] = useState<number | null>(null);

  const handleSelect = (item: Commande) => {
    setLastSelected(commande.selected);
    setCommande({ ...commande, selected: item.id });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <img
          src="/empty-state.svg"
          width={180}
          height={180}
          alt="Aucune commande"
          className="mb-6"
        />
        <div className="text-xl font-semibold mb-2">
          Aucune commande trouvée
        </div>
        <div className="text-gray-500 mb-6 text-center">
          Essayez de modifier vos filtres ou créez une nouvelle commande.
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition">
          Créer une commande
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full overflow-y-auto  min-h-0">
      {/* Liste des commandes à gauche */}
      <div className="w-full md:w-1/2 lg:w-2/5 xl:w-2/5 border-r h-full min-h-0 flex flex-col">
        <ScrollArea className="flex-1 h-full max-h-[82vh] overflow-y-auto">
          <div className="flex flex-col gap-4 p-4 pt-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative group bg-white shadow rounded-lg border p-4 flex flex-col gap-2 transition-all hover:shadow-lg cursor-pointer",
                  commande.selected === item.id &&
                    "ring-2 ring-red-600 border-red-600"
                )}
                tabIndex={0}
                aria-selected={commande.selected === item.id}
                onClick={() => handleSelect(item)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={item.client?.img_url || "/avatar-default.svg"}
                      className="rounded-full object-cover w-full h-full"
                      alt="Avatar"
                    />
                    <AvatarFallback className="text-xl flex items-center justify-center">
                      {item.client?.prenom?.[0] || ""}
                      {item.client?.nom?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-red-700">
                      {item.client?.prenom} {item.client?.nom}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.client?.Tel}
                    </div>
                  </div>
                  <span
                    className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${
                      item.statut === "Livré"
                        ? "bg-green-100 text-green-700"
                        : item.statut === "Annulé"
                        ? "bg-gray-200 text-gray-500"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.statut || "En cours"}
                  </span>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      className="p-1 rounded hover:bg-gray-100"
                      title="Voir"
                    >
                      <FaArrowRight />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-100"
                      title="Éditer"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414 1.414-4.243a4 4 0 01.828-1.414z" />
                      </svg>
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-100"
                      title="Supprimer"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                  <span>{item.annonce?.source}</span>
                  <span>→</span>
                  <span>{item.annonce?.destination}</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 items-center">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Créée :{" "}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("fr-FR")
                      : "-"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Départ :{" "}
                    {item.annonce?.date_depart
                      ? new Date(item.annonce.date_depart).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Arrivée :{" "}
                    {item.annonce?.date_arrive
                      ? new Date(item.annonce.date_arrive).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-"}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded ${
                      item.validation_status
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.validation_status ? "Validé" : "Non validé"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      item.payment_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.payment_status === "paid" ? "Payé" : "Non payé"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded font-semibold bg-gray-100 text-gray-700`}
                  >
                    ID: {item.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* Détail de la commande sélectionnée à droite */}
      <div className="hidden md:block flex-1 max-h-[82vh] overflow-y-auto p-4 min-h-0">
        <AnimatePresence mode="wait">
          {commande.selected ? (
            <motion.div
              key={commande.selected}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <PersonalInfo
                commande={items.find((item) => item.id === commande.selected)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center h-full text-gray-400 text-lg"
            >
              Sélectionnez une commande pour voir le détail
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
