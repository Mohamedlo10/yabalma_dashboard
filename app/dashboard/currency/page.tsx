"use client";

import {
  creerCurrency,
  getAllCurrency,
  modifierCurrency,
  supprimerCurrency,
} from "@/app/api/currency/query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/dialogConfirm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseSession } from "@/lib/authMnager";
import Drawer from "@mui/material/Drawer";
import { DollarSign, Plus, Save, Trash2, X, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Currency } from "./schema";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<any>(null);
  const [selectedCurrencyName, setSelectedCurrencyName] = useState<any>(null);
  const [isAddingCurrency, setIsAddingCurrency] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  let [color, setColor] = useState("#ffffff");
  const [currency, setCurrency] = useState<Currency>({
    currency: "",
    value: 0,
  });
  const router = useRouter();

  async function fetchData() {
    setIsLoading(true);
    try {
      const data: any = await getAllCurrency();
      if (data && data.length > 0) {
        setCurrencies(data);
        console.log(data);
      }

      const sessionData = getSupabaseSession();
      if (sessionData != null) {
        if (sessionData.access_groups?.settings) {
          console.log("Accès autorisé...");
        } else {
          router.push(`/dashboard`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des devises :", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrency({ 
      ...currency, 
      [name]: name === 'value' ? parseFloat(value) || 0 : value 
    });
  };

  const deleteCurrency = async (id: any) => {
    try {
      await supprimerCurrency(id);
      console.log("Suppression réussie");
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la suppression de la devise:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(currency);
      await creerCurrency(currency);

      setCurrency({
        currency: "",
        value: 0,
      });
      setIsDrawerOpen(false);
      setSelectedCurrency(null);
      fetchData();
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la devise:", error);
      setIsLoading(false);
    }
  };

  const handleCurrencyClick = (currencyItem: Currency) => {
    setCurrency(currencyItem);
    setIsAddingCurrency(false);
    setIsDrawerOpen(true);
  };

  const handleAddCurrencyClick = () => {
    setCurrency({
      currency: "",
      value: 0,
    });
    setIsAddingCurrency(true);
    setIsDrawerOpen(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(currency);
      await modifierCurrency(currency.id, currency);

      setCurrency({
        currency: "",
        value: 0,
      });
      setIsDrawerOpen(false);
      setSelectedCurrency(null);
      fetchData();
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la modification de la devise:", error);
      setIsLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCurrency(null);
  };

  const handleDeleteClick = (currencyItem: Currency) => {
    setSelectedCurrencyId(currencyItem.id);
    setSelectedCurrencyName(currencyItem.currency);
    setDialogOpen(true);
  };

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
    <>
      <Drawer anchor="right" open={isDrawerOpen} onClose={closeDrawer}>
        <div className="p-4 flex items-center justify-center h-full w-[32vw]">
          {isAddingCurrency ? (
            <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
              <h2 className="mb-8 text-2xl font-bold">
                Ajouter une Nouvelle Devise
              </h2>
              <form className="w-full" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="currency" className="block text-sm font-bold mb-2">
                    Devise
                  </Label>
                  <Input
                    type="text"
                    id="currency"
                    name="currency"
                    value={currency.currency}
                    onChange={handleInputChange}
                    placeholder="Ex: USD, EUR, XOF..."
                    className="w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="value" className="block text-sm font-bold mb-2">
                    Valeur en CFA
                  </Label>
                  <Input
                    type="number"
                    id="value"
                    name="value"
                    value={currency.value}
                    onChange={handleInputChange}
                    placeholder="Valeur de la devise"
                    className="w-full"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="ml-auto pt-8 w-full items-center justify-center flex font-medium">
                  <Button type="submit" className="w-fit h-10 font-bold">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
              <h2 className="mb-8 text-2xl font-bold">Modifier la devise</h2>
              <form onSubmit={handleSubmitEdit} className="w-full py-4">
                <div className="py-4">
                  <Label htmlFor="currency-edit" className="block text-sm font-bold mb-2">
                    Devise
                  </Label>
                  <Input
                    type="text"
                    id="currency-edit"
                    name="currency"
                    value={currency?.currency}
                    onChange={handleInputChange}
                    placeholder="Ex: USD, EUR, XOF..."
                    className="w-full"
                    required
                  />
                </div>
                <div className="py-4">
                  <Label htmlFor="value-edit" className="block text-sm font-bold mb-2">
                    Valeur
                  </Label>
                  <Input
                    type="number"
                    id="value-edit"
                    name="value"
                    value={currency?.value}
                    onChange={handleInputChange}
                    placeholder="Valeur de la devise"
                    className="w-full"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div className="ml-auto pt-8 w-full items-center justify-center flex font-medium">
                  <Button type="submit" className="font-bold gap-2">
                    <Save />
                    Enregistrer
                  </Button>
                </div>
              </form>
              <Button
                onClick={closeDrawer}
                className="font-bold bg-white hover:text-slate-900 hover:bg-slate-100 text-slate-600">
                <X />
                Annuler
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      <div className="hidden flex-col max-h-[90vh] overflow-y-auto md:flex">
        <div className="border-b"></div>
        <div className="flex-1 md:space-y-4 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-4xl flex items-center justify-center gap-2 font-bold tracking-tight">
              <DollarSign /> Gestion des Devises
            </h2>
            <Button
              type="button"
              className="w-fit h-fit font-bold bg-red-600"
              onClick={handleAddCurrencyClick}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une Devise
            </Button>
          </div>

          <ConfirmDialog
            isOpen={isDialogOpen}
            message={`Êtes-vous sûr de vouloir supprimer la devise : ${selectedCurrencyName} ?`}
            onConfirm={() => {
              if (selectedCurrencyId !== null) {
                deleteCurrency(selectedCurrencyId);
                setSelectedCurrencyId(null);
                setSelectedCurrencyName(null);
              }
              setDialogOpen(false);
            }}
            onCancel={() => {
              setDialogOpen(false);
              setSelectedCurrencyId(null);
              setSelectedCurrencyName(null);
            }}
          />

          <div className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currencies.map((currencyItem) => (
              <Card key={currencyItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {currencyItem.currency}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {currencyItem.value.toLocaleString('fr-FR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      Créée le: {currencyItem.created_at ? 
                        new Date(currencyItem.created_at).toLocaleDateString('fr-FR') : 
                        'N/A'
                      }
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="w-full grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleDeleteClick(currencyItem)}
                      variant="destructive"
                      size="sm"
                      className="font-bold gap-1">
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                    <Button
                      onClick={() => handleCurrencyClick(currencyItem)}
                      size="sm"
                      className="font-bold gap-1">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {currencies.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune devise</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter une nouvelle devise.
              </p>
              <div className="mt-6">
                <Button
                  type="button"
                  className="font-bold bg-red-600"
                  onClick={handleAddCurrencyClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une Devise
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 