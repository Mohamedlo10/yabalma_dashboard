"use client";
import { useEffect, useState } from "react";
import { getCommandesWithWarehouse } from "@/app/api/commandes/query";
import { getAnnoncesEntrepot } from "@/app/api/annonces/query";
import { modifierCommande } from "@/app/api/commandes/query";

export default function TransfererCommandesPage() {
  // Sélectionne l'annonce cible la plus proche et ouvre le modal
  const handleTransferClick = async (commande: any) => {
    setError("");
    try {
      const annonces = await getAnnoncesEntrepot();
      const annoncesArray = Array.isArray(annonces) ? annonces : [];
      const now = new Date();
      // Filtrer les annonces compatibles
      const compatibles = annoncesArray.filter((annonce: any) => {
        const dateDepart = new Date(annonce.date_depart);
        return (
          annonce.statut === "Entrepot" &&
          annonce.type_transport === commande.detail_commande?.mode &&
          dateDepart >= now
        );
      });
      let cible = null;
      if (compatibles.length > 0) {
        // Prendre l'annonce avec la date la plus proche
        cible = compatibles.reduce((prev: any, curr: any) => {
          const prevDate = new Date(prev.date_depart);
          const currDate = new Date(curr.date_depart);
          return currDate < prevDate ? curr : prev;
        });
      }
      if (!cible) {
        setError("Aucune annonce compatible trouvée");
        return;
      }
      setSelectedCommande(commande);
      setAnnonceCible(cible);
      setShowModal(true);
    } catch (err) {
      setError("Erreur lors du calcul du transfert");
    }
  };

  // Confirme le transfert et met à jour la commande
  const handleConfirmTransfer = async () => {
    if (!selectedCommande || !annonceCible) return;
    setError("");
    setShowModal(false);
    try {
      await modifierCommande(selectedCommande.id, {
        id_annonce: annonceCible.id_annonce,
      });
      setCommandes((prev: any[]) =>
        prev.map((c) =>
          c.id === selectedCommande.id
            ? { ...c, id_annonce: annonceCible.id }
            : c
        )
      );
      setSelectedCommande(null);
      setAnnonceCible(null);
    } catch (err) {
      setError("Erreur lors du transfert");
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
                  className="border rounded p-4 flex flex-col gap-2"
                >
                  <div>
                    <span className="font-semibold">
                      Commande #{commande.id}
                    </span>
                    <span className="ml-2">
                      Prix: {commande.warehouse_info?.price} XOF
                    </span>
                    <span className="ml-2">
                      Poids: {commande.warehouse_info?.weight} kg
                    </span>
                  </div>
                  <span className="font-semibold text-blue-700">
                    Type transport : {commande.detail_commande?.mode}
                  </span>
                  <div>
                    <span>Trajet actuelle:</span>
                    <span className="font-bold text-xs">
                      {" "}
                      {commande.id_annonce}
                    </span>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => handleTransferClick(commande)}
                  >
                    Transférer vers trajet le plus proche
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Modal de confirmation */}
      {showModal && annonceCible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Confirmer le transfert</h3>
            <p className="mb-4">
              Voulez-vous vraiment transférer la commande{" "}
              <b>#{selectedCommande?.id}</b> vers le trajet&nbsp;? <br />
              <span className="font-semibold text-blue-700">
                Du {new Date(annonceCible.date_depart).toLocaleString("fr-FR")}
                <br />
                Type transport : {annonceCible.type_transport}
              </span>
            </p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleConfirmTransfer}
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
