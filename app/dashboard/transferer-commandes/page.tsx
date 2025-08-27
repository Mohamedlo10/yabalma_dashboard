"use client";
import { useEffect, useState } from "react";
import { getCommandesWithWarehouse } from "@/app/api/commandes/query";
import { getAnnoncesEntrepot } from "@/app/api/annonces/query";
import { modifierCommande } from "@/app/api/commandes/query";

export default function TransfererCommandesPage() {
  // Nouvelle logique : select pour choisir l'annonce compatible
  const [annoncesCompatibles, setAnnoncesCompatibles] = useState<{
    [key: number]: any[];
  }>({});
  const [selectedAnnonce, setSelectedAnnonce] = useState<{
    [key: number]: string;
  }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    commandeId: number;
    newAnnonceId: string;
    oldAnnonceId: string;
  } | null>(null);

  const fetchAnnoncesCompatibles = async (commande: any) => {
    try {
      const annonces = await getAnnoncesEntrepot();
      console.log(annonces);
      const annoncesArray = Array.isArray(annonces) ? annonces : [];
      const now = new Date();

      // Récupérer l'annonce actuelle de la commande
      const annonceActuelle = annoncesArray.find(
        (annonce: any) => annonce.id_annonce === commande.id_annonce
      );

      // Filtrer et trier par date
      const compatibles = annoncesArray
        .filter((annonce: any) => {
          const dateDepart = new Date(annonce.date_depart);
          return (
            annonce.statut === "Entrepot" &&
            annonce.type_transport === commande.detail_commande?.mode &&
            dateDepart >= now
          );
        })
        .sort(
          (a: any, b: any) =>
            new Date(a.date_depart).getTime() -
            new Date(b.date_depart).getTime()
        );

      // Ajouter l'annonce actuelle au début si elle existe et n'est pas déjà dans la liste
      let toutesAnnonces = [...compatibles];
      if (
        annonceActuelle &&
        !compatibles.find((a) => a.id_annonce === annonceActuelle.id_annonce)
      ) {
        toutesAnnonces.unshift(annonceActuelle);
      }

      setAnnoncesCompatibles((prev) => ({
        ...prev,
        [commande.id]: toutesAnnonces,
      }));
    } catch (err) {
      setError("Erreur lors du chargement des annonces compatibles");
    }
  };

  const handleSelectAnnonce = async (commandeId: number, annonceId: string) => {
    const currentAnnonceId = selectedAnnonce[commandeId] || "";

    // Si c'est le même trajet, ne rien faire
    if (currentAnnonceId === annonceId) {
      return;
    }

    // Si c'est un changement, demander confirmation
    if (currentAnnonceId && currentAnnonceId !== annonceId) {
      setPendingChange({
        commandeId,
        newAnnonceId: annonceId,
        oldAnnonceId: currentAnnonceId,
      });
      setShowConfirmDialog(true);
      return;
    }

    // Si c'est la première sélection, procéder directement
    await processAnnonceChange(commandeId, annonceId);
  };

  const processAnnonceChange = async (
    commandeId: number,
    annonceId: string
  ) => {
    setError("");
    try {
      await modifierCommande(commandeId, { id_annonce: annonceId });
      setCommandes((prev: any[]) =>
        prev.map((c) =>
          c.id === commandeId ? { ...c, id_annonce: annonceId } : c
        )
      );
      setSelectedAnnonce((prev) => ({ ...prev, [commandeId]: annonceId }));
    } catch (err) {
      setError("Erreur lors du transfert");
    }
  };

  const confirmAnnonceChange = async () => {
    if (pendingChange) {
      await processAnnonceChange(
        pendingChange.commandeId,
        pendingChange.newAnnonceId
      );
      setShowConfirmDialog(false);
      setPendingChange(null);
    }
  };

  const cancelAnnonceChange = () => {
    setShowConfirmDialog(false);
    setPendingChange(null);
    // Remettre la valeur précédente dans le select
    if (pendingChange) {
      setSelectedAnnonce((prev) => ({
        ...prev,
        [pendingChange.commandeId]: pendingChange.oldAnnonceId,
      }));
    }
  };

  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [annonceCible, setAnnonceCible] = useState<any>(null);

  useEffect(() => {
    async function fetchCommandes() {
      setLoading(true);
      try {
        const data = await getCommandesWithWarehouse();
        if (Array.isArray(data)) {
          console.log(data);
          setCommandes(data);
          // Initialiser les annonces sélectionnées avec les annonces actuelles des commandes
          const initialAnnonces: { [key: number]: string } = {};
          data.forEach((commande: any) => {
            if (commande.id_annonce) {
              initialAnnonces[commande.id] = commande.id_annonce;
            }
          });
          setSelectedAnnonce(initialAnnonces);
        } else {
          setError(data.error || "Erreur lors du chargement des commandes");
        }
      } catch (err) {
        setError("Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    }
    fetchCommandes();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Transférer Commandes</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          {commandes.length === 0 ? (
            <div>Aucune commande à transférer.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commandes.map((commande: any) => (
                <div
                  key={commande.id}
                  className="border rounded-lg p-4 flex flex-col gap-3 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                  onMouseEnter={() => {
                    if (!annoncesCompatibles[commande.id])
                      fetchAnnoncesCompatibles(commande);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-base text-gray-800">
                      Commande #{commande.id}
                    </span>
                    <div className="flex flex-col items-start font-semibold md:flex-row gap-4 text-sm text-gray-600">
                      <span>Prix: {commande.warehouse_info?.price} XOF</span>
                      <span>Poids: {commande.warehouse_info?.weight} kg</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <span className="font-semibold text-blue-700 text-sm">
                      Type transport : {commande.detail_commande?.mode}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Trajet actuel:
                      </span>
                      {commande.id_annonce ? (
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
                          📍{" "}
                          {new Date(
                            commande.annonce.date_depart
                          ).toLocaleDateString("fr-FR")}{" "}
                        </span>
                      ) : (
                        <span className="font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">
                          Aucun trajet assigné
                        </span>
                      )}
                    </div>
                    {commande.id_annonce && (
                      <div className="mt-2 text-xs text-gray-500">
                        Ce trajet sera présélectionné dans la liste ci-dessous
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Sélectionner un trajet compatible :
                    </label>
                    <select
                      className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={selectedAnnonce[commande.id] || ""}
                      onChange={(e) =>
                        handleSelectAnnonce(commande.id, e.target.value)
                      }
                    >
                      <option value="">-- Choisir un trajet --</option>
                      {(annoncesCompatibles[commande.id] || []).map(
                        (annonce: any) => (
                          <option
                            key={annonce.id_annonce}
                            value={annonce.id_annonce}
                            className={
                              annonce.id_annonce === commande.id_annonce
                                ? "font-bold text-blue-600"
                                : ""
                            }
                          >
                            {annonce.id_annonce === commande.id_annonce
                              ? "📍 "
                              : ""}
                            Départ:{" "}
                            {new Date(annonce.date_depart).toLocaleDateString(
                              "fr-FR"
                            )}{" "}
                            | {annonce.type_transport}
                            {annonce.id_annonce === commande.id_annonce
                              ? " (Trajet actuel)"
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialog de confirmation pour le changement de trajet */}
      {showConfirmDialog && pendingChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmer le changement de trajet
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                Êtes-vous sûr de vouloir changer le trajet de la commande #
                {pendingChange.commandeId} ?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <strong>Attention :</strong> Ce changement peut affecter le
                  suivi de la commande.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelAnnonceChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmAnnonceChange}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
