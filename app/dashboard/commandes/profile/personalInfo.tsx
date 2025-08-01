"use client";
// import { modifiercommande, supprimercommande } from '@/app/api/commandes/query';
import { modifierCommande, supprimerCommande } from "@/app/api/commandes/query";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/dialogConfirm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  XCircle,
  CreditCard,
  User,
  MapPin,
  Truck,
  Package,
  Phone,
  BadgeCheck,
  BadgeX,
  Edit,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { Commande } from "../schema";
import ColisInfo from "@/app/dashboard/commandes/profile/colisInfo/colisInfo";
import ArticlesList from "@/components/ui/article/article-list";

type PersonalInfoProps = {
  commande: Commande | null | undefined;
};

const PersonalInfo: React.FC<PersonalInfoProps> = ({ commande }) => {
  const [editMode, seteditMode] = useState(false);
  const activeEdit = () => {
    seteditMode(!editMode);
  };
  const router = useRouter();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [Actucommande, setcommande] = useState({
    ...commande,
    payment_status: commande?.payment_status || "",
    cancelled_status: commande?.cancelled_status || false,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setcommande({ ...Actucommande, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(Actucommande);
    try {
      const { client, annonce, ...commandeSansClientEtAnnonce } = Actucommande;
      const response = await modifierCommande(
        Actucommande.id,
        commandeSansClientEtAnnonce
      );
      console.log("Reussi");
      seteditMode(false);
    } catch (error) {
      console.error("Erreur lors de la modification de l'commande:", error);
    }
  };

  const deleteUser = async () => {
    try {
      const response = await supprimerCommande(Actucommande.id);
      console.log("Suppression reussi");
      router.back();
    } catch (error) {
      console.error("Erreur lors de la Suppression de l'commande:", error);
    }
  };

  return (
    <div className="w-full overflow-y-auto max-w-2xl mx-auto p-2">
      <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b pb-3">
          <User className="w-6 h-6 text-red-600" />
          <div className="font-bold text-lg text-red-700">
            {Actucommande.client?.prenom} {Actucommande.client?.nom}
          </div>
          <span className="ml-auto px-2 py-2 rounded-xl text-lg font-semibold bg-gray-100 text-gray-700">
            ID: {Actucommande.id}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" /> {Actucommande.client?.Tel}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Créée :{" "}
            {Actucommande.created_at
              ? new Date(Actucommande.created_at).toLocaleDateString("fr-FR")
              : "-"}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1 font-semibold">
              <MapPin className="w-4 h-4" /> Départ
            </div>
            <div className="text-sm">
              {Actucommande?.annonce?.source}{" "}
              {Actucommande?.annonce?.sourceAddress}
            </div>
            <div className="text-xs text-gray-500">
              {Actucommande?.annonce?.date_depart
                ? new Date(Actucommande.annonce.date_depart).toLocaleDateString(
                    "fr-FR"
                  )
                : "-"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1 font-semibold">
              <MapPin className="w-4 h-4" /> Destination
            </div>
            <div className="text-sm">
              {Actucommande?.annonce?.destination}{" "}
              {Actucommande?.annonce?.destinationAddress}
            </div>
            <div className="text-xs text-gray-500">
              {Actucommande?.annonce?.date_arrive
                ? new Date(Actucommande.annonce.date_arrive).toLocaleDateString(
                    "fr-FR"
                  )
                : "-"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1 font-semibold">
              <Truck className="w-4 h-4" /> Transport
            </div>
            <div className="text-sm">
              {Actucommande?.annonce?.type_transport}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
              Actucommande.validation_status
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {Actucommande.validation_status ? (
              <BadgeCheck className="w-4 h-4" />
            ) : (
              <BadgeX className="w-4 h-4" />
            )}{" "}
            {Actucommande.validation_status ? "Validée" : "Non validée"}
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
              Actucommande.payment_status === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {Actucommande.payment_status === "paid" ? (
              <CreditCard className="w-4 h-4" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}{" "}
            {Actucommande.payment_status === "paid" ? "Payée" : "Non payée"}
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
              Actucommande.statut === "Livré"
                ? "bg-green-100 text-green-700"
                : Actucommande.statut === "Annulé"
                ? "bg-gray-200 text-gray-500"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {Actucommande.statut || "En cours"}
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
              Actucommande.cancelled_status
                ? "bg-gray-300 text-gray-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {Actucommande.cancelled_status ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}{" "}
            {Actucommande.cancelled_status ? "Annulée" : "Active"}
          </span>
        </div>
        <div className="grid grid-cols-1  md:grid-cols-2 gap-6 mt-2 items-start">
          {/* Bloc détails de la commande */}
          <div className="bg-gray-50 col-span-2 rounded-lg p-3 flex flex-col gap-4 min-w-[220px]">
            <div className="flex items-center gap-1 font-semibold mb-2">
              <Package className="w-4 h-4" /> Détails de la commande
            </div>
            <div className="text-sm">
              Type : {Actucommande?.detail_commande?.type || "N/A"}
            </div>
            <div className="text-sm">
              Nombre d'articles :{" "}
              {Actucommande?.detail_commande?.articles?.length || 0}
            </div>
            <div className="text-sm">
              Prix total : {Actucommande?.total_price || "N/A"}{" "}
              {Actucommande.detail_commande?.articles[0]?.currency}
            </div>
            <div className="text-sm">
              Destinataire :{" "}
              {Actucommande?.detail_commande?.first_name || "N/A"}
            </div>
            <div className="text-sm">
              Téléphone destinataire :{" "}
              {Actucommande?.detail_commande?.destinataire_number || "N/A"}
            </div>
            {/* Bouton pour ouvrir le dialog des articles */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition w-fit">
                  Voir les colis / articles
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Liste des colis / articles</DialogTitle>
                </DialogHeader>
                {Actucommande?.detail_commande?.articles &&
                Actucommande.detail_commande.articles.length > 0 ? (
                  <ArticlesList
                    articles={Actucommande.detail_commande.articles}
                    variant="modern"
                  />
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    Aucun article
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
          {/* Bloc liste des colis/articles */}
          {/* <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2 min-w-[220px]">
            <div className="flex items-center gap-1 font-semibold mb-2">
              <Package className="w-4 h-4 text-blue-600" /> Colis / Articles
            </div>
            {Actucommande?.detail_commande?.articles &&
            Actucommande.detail_commande.articles.length > 0 ? (
              <ArticlesList articles={Actucommande.detail_commande.articles} />
            ) : (
              <div className="text-xs text-gray-400 italic">Aucun article</div>
            )}
          </div> */}
        </div>
        <div className="flex gap-4 mt-4 justify-end">
          <Button
            onClick={() => setDialogOpen(true)}
            className="font-bold gap-2 bg-red-700 hover:bg-red-800 flex items-center"
          >
            <Trash2 className="w-4 h-4" /> Supprimer
          </Button>
          <Button
            onClick={activeEdit}
            className="font-bold gap-2 flex items-center"
          >
            <Edit className="w-4 h-4" /> Modifier
          </Button>
        </div>
        <ConfirmDialog
          isOpen={isDialogOpen}
          message={`Etes-vous sûr de vouloir supprimer la commande de ${Actucommande.client?.prenom}  ${Actucommande.client?.nom} ?`}
          onConfirm={() => {
            deleteUser();
            setDialogOpen(false);
          }}
          onCancel={() => setDialogOpen(false)}
        />
        {editMode && commande && (
          <form
            className="w-full mb-6 mt-4 bg-gray-50 rounded-lg p-4 flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
              {/* Paiement */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Paiement
                </label>
                <select
                  name="payment_status"
                  value={Actucommande.payment_status}
                  onChange={(e) =>
                    setcommande((prevState) => ({
                      ...prevState,
                      payment_status: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 shadow-sm transition"
                  required
                >
                  <option value="paid">Payé</option>
                  <option value="unpaid">Non payé</option>
                </select>
              </div>
              {/* Annuler */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                  <XCircle className="w-4 h-4 text-red-500" /> Annulation
                </label>
                <select
                  name="cancelled_status"
                  value={Actucommande.cancelled_status ? "true" : "false"}
                  onChange={(e) =>
                    setcommande((prevState) => ({
                      ...prevState,
                      cancelled_status: e.target.value === "true",
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-800 shadow-sm transition"
                  required
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>
              {/* Statut */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                  <BadgeCheck className="w-4 h-4 text-green-600" /> Statut
                </label>
                <select
                  name="statut"
                  value={Actucommande.statut}
                  onChange={(e) =>
                    setcommande((prevState) => ({
                      ...prevState,
                      statut: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-800 shadow-sm transition"
                  required
                >
                  <option value="En attente">En attente</option>
                  <option value="Validé">Validé</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-4">
              <Button
                onClick={activeEdit}
                className="font-bold bg-white hover:text-slate-900 hover:bg-slate-100 text-slate-600 gap-2 border border-gray-300"
              >
                <XCircle className="w-4 h-4" /> Annuler
              </Button>
              <Button
                type="submit"
                className="font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="w-4 h-4" /> Enregistrer
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PersonalInfo;
