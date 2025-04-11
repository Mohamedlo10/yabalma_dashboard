"use client";
// import { modifiercommande, supprimercommande } from '@/app/api/commandes/query';
import { modifierCommande, supprimerCommande } from "@/app/api/commandes/query";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/dialogConfirm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Save, Trash2, UserRound, UserRoundPen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { Commande } from "../schema";

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
    <div>
      <div className="md:p-3 p-1 bg-zinc-50 rounded-md w-full items-center justify-start flex flex-col gap-1">
        <div className="flex flex-col overflow-y-auto  md:max-h-[50vh] max-h-[44vh]">
          <div>
            <div className="flex items-center my-4">
              <UserRound />
              <div className="ml-2 text-black text-sm sm:text-xl font-bold">
                Informations
              </div>
            </div>

            {editMode && commande ? (
              <form className="w-full mb-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-3 grid-cols-2 md:gap-36 gap-4 rounded-lg">
                  {/* <!-- First Bloc --> */}
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-gray-500 text-sm sm:text-base">
                        Paiement
                      </div>
                      <select
                        name="cancelled_status"
                        value={Actucommande.payment_status} // Convertit le boolean en chaîne
                        onChange={(e) =>
                          setcommande((prevState) => ({
                            ...prevState,
                            payment_status: e.target.value,
                          }))
                        }
                        className="border p-2 rounded w-full"
                        required
                      >
                        <option value="paid">Payer</option>
                        <option value="unpaid">Non Payer</option>
                      </select>
                    </div>
                  </div>
                  {/* <!-- Second Bloc --> */}
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-gray-500 text-sm sm:text-base">
                        Annuler
                      </div>
                      <select
                        name="cancelled_status"
                        value={Actucommande.cancelled_status ? "true" : "false"} // Convertit le boolean en chaîne
                        onChange={(e) =>
                          setcommande((prevState) => ({
                            ...prevState,
                            cancelled_status: e.target.value === "true", // Convertit la chaîne en boolean
                          }))
                        }
                        className="border p-2 rounded w-full"
                        required
                      >
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    </div>
                  </div>

                  {/* last bloc */}
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-gray-500 text-sm sm:text-base">
                        Statut
                      </div>
                      <select
                        name="cancelled_status"
                        value={Actucommande.statut} // Convertit le boolean en chaîne
                        onChange={(e) =>
                          setcommande((prevState) => ({
                            ...prevState,
                            statut: e.target.value,
                          }))
                        }
                        className="border p-2 rounded w-full"
                        required
                      >
                        <option value="En attente">En attente</option>
                        <option value="Validé">Validé</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-12">
                  <Button
                    onClick={activeEdit}
                    className="font-bold bg-white hover:text-slate-900 hover:bg-slate-100 text-slate-600  gap-2"
                  >
                    <X />
                    Annuler
                  </Button>
                  <Button type="submit" className="font-bold gap-2 ">
                    <Save />
                    Enregistrer
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mb-6">
                <div className="grid grid-cols-3 xl:gap-16 gap-0 md:gap-4 rounded-lg">
                  {/* <!-- First Bloc --> */}
                  <div className="p-4">
                    {Actucommande.annonce ? (
                      <>
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm sm:text-base">
                            Depart
                          </div>
                          <div className="leading-6 mt-1 text-sm sm:text-base">
                            {Actucommande?.annonce.source}{" "}
                            {Actucommande?.annonce.sourceAddress} le{" "}
                            {format(
                              new Date(Actucommande?.annonce.date_depart),
                              "dd/MM/yyyy",
                              { locale: fr }
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm sm:text-base">
                            Destination
                          </div>
                          <div className="leading-6 mt-1 text-sm sm:text-base">
                            {Actucommande?.annonce.destination}{" "}
                            {Actucommande?.annonce.destinationAddress} le{" "}
                            {format(
                              new Date(Actucommande?.annonce.date_arrive),
                              "dd/MM/yyyy",
                              { locale: fr }
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm sm:text-base">
                            Type de Transport
                          </div>
                          <div className="leading-6 mt-1 text-sm sm:text-base">
                            {Actucommande?.annonce.type_transport}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm sm:text-base">
                            Date de publication
                          </div>
                          {commande ? (
                            <div className="leading-6 mt-1 text-sm sm:text-base">
                              {format(
                                new Date(commande?.created_at),
                                "dd MMMM yyyy",
                                { locale: fr }
                              )}
                              {` à ${format(
                                new Date(commande?.created_at),
                                "HH:mm"
                              )}`}
                            </div>
                          ) : (
                            <div className="text-2xl">
                              Erreur lors du chargement des donnees
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div></div>
                    )}
                  </div>
                  {/* <!-- Second Bloc --> */}
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-gray-500 text-sm sm:text-base">
                        Annuler
                      </div>
                      <div className="leading-6 mt-1 text-sm sm:text-base">
                        {Actucommande.cancelled_status ? "Oui" : "Non"}{" "}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-gray-500 text-sm sm:text-base">
                        État de paiement
                      </div>
                      <div
                        className={`leading-6 mt-1 text-sm sm:text-base px-2 py-1 rounded-md text-white 
                    ${
                      Actucommande?.payment_status === "unpaid"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                      >
                        {Actucommande?.payment_status === "unpaid"
                          ? "Non réglé"
                          : "Réglé"}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-gray-500 text-sm sm:text-base">
                        Validé
                      </div>
                      <div
                        className={`leading-6 mt-1 text-sm sm:text-base px-2 py-1 rounded-md text-white 
                    ${
                      !Actucommande?.validation_status
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                      >
                        {Actucommande?.validation_status ? "Oui" : "Non"}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-gray-500 text-sm sm:text-base">
                        Statut
                      </div>
                      <div className="leading-6 mt-1 text-sm sm:text-base">
                        {Actucommande?.statut}
                      </div>
                    </div>
                  </div>
                  {/* <!-- Last Bloc --> */}
                  <div className="p-4">
                    {Actucommande.detail_commande ? (
                      <>
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm sm:text-base">
                            Type de la commande
                          </div>
                          <div className="leading-6 mt-1 text-sm sm:text-base">
                            {Actucommande?.detail_commande?.type || "N/A"}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm sm:text-base">
                            Nombre d'article
                          </div>
                          <div className="leading-6 mt-1 text-sm sm:text-base">
                            {Actucommande?.detail_commande?.articles?.length ==
                            0
                              ? "N/A"
                              : Actucommande?.detail_commande?.articles?.length}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm sm:text-base">
                            Prix total
                          </div>
                          <div className="leading-6 mt-1 text-sm sm:text-base">
                            {Actucommande?.total_price || "N/A"}{" "}
                            {Actucommande.detail_commande?.articles[0].currency}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-gray-500 text-sm sm:text-base">
                            Numero du destinataire
                          </div>
                          <div className="leading-6 mt-1 text-sm sm:text-base">
                            {Actucommande?.detail_commande
                              ?.destinataire_number || "N/A"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-12">
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="font-bold gap-2 bg-red-700 hover:bg-red-800"
                  >
                    <Trash2 />
                    Supprimer
                  </Button>
                  <Button onClick={activeEdit} className="font-bold gap-2">
                    <UserRoundPen />
                    Modifier
                  </Button>
                  <ConfirmDialog
                    isOpen={isDialogOpen}
                    message={`Etes-vous sûr de vouloir supprimer la commande de ${Actucommande.client?.prenom}  ${Actucommande.client?.nom} ?`}
                    onConfirm={() => {
                      deleteUser();
                      setDialogOpen(false);
                    }}
                    onCancel={() => setDialogOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
