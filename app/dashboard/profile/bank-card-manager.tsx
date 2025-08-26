"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getUserBankCards,
  createBankCard,
  updateBankCard,
  updateCardBalance,
  topUpCardBalance,
  updateCardStatus,
  deleteBankCard,
  BankCardData,
  BalanceUpdateData,
} from "@/app/api/wallets/query";
import { getAllCurrency } from "@/app/api/currency/query";
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Wallet,
  Eye,
  EyeOff,
  DollarSign,
} from "lucide-react";
import { Loader2 } from "lucide-react";

interface BankCardManagerProps {
  userId: string;
  userEmail: string;
}

export function BankCardManager({ userId, userEmail }: BankCardManagerProps) {
  const [cards, setCards] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showCardNumbers, setShowCardNumbers] = useState<{
    [key: string]: boolean;
  }>({});
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [cardToReveal, setCardToReveal] = useState<string | null>(null);

  // États pour les formulaires
  const [createForm, setCreateForm] = useState<
    BankCardData & { initialBalance: number; currency: string }
  >({
    card_number: "",
    expiry_date: "",
    cvv: "",
    cardholder_name: "",
    card_type: "visa",
    issuing_bank: "",
    credit_limit: 0,
    pin_code: "",
    initialBalance: 0,
    currency: "XOF",
  });

  const [balanceForm, setBalanceForm] = useState<BalanceUpdateData>({
    amount: 0,
    currency: "XOF",
  });

  const [editForm, setEditForm] = useState<BankCardData>({
    card_number: "",
    expiry_date: "",
    cvv: "",
    cardholder_name: "",
    card_type: "visa",
    issuing_bank: "",
    credit_limit: 0,
    pin_code: "",
  });

  useEffect(() => {
    fetchCards();
    fetchCurrencies();
  }, [userId]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const cardsData = await getUserBankCards(userId);
      setCards(cardsData);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Erreur lors du chargement des cartes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const currenciesData = await getAllCurrency();
      if (Array.isArray(currenciesData)) {
        setCurrencies(currenciesData);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const handleCreateCard = async () => {
    try {
      const { initialBalance, currency, ...cardData } = createForm;

      await createBankCard(
        userId,
        userEmail,
        cardData,
        initialBalance,
        currency
      );

      toast.success("Carte créée avec succès !");
      setIsCreateModalOpen(false);
      setCreateForm({
        card_number: "",
        expiry_date: "",
        cvv: "",
        cardholder_name: "",
        card_type: "visa",
        issuing_bank: "",
        credit_limit: 0,
        pin_code: "",
        initialBalance: 0,
        currency: "XOF",
      });
      fetchCards();
    } catch (error: any) {
      console.error("Error creating card:", error);

      // Afficher le message d'erreur spécifique si disponible
      const errorMessage =
        error?.message || "Erreur lors de la création de la carte";

      if (errorMessage.includes("déjà un portefeuille")) {
        toast.error(
          "❌ Vous possédez déjà un portefeuille. Un utilisateur ne peut avoir qu'un seul wallet/carte."
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEditCard = async () => {
    if (!selectedCard) return;

    try {
      await updateBankCard(selectedCard.id, editForm);
      toast.success("Informations de la carte mises à jour avec succès !");
      setIsEditModalOpen(false);
      setSelectedCard(null);
      setEditForm({
        card_number: "",
        expiry_date: "",
        cvv: "",
        cardholder_name: "",
        card_type: "visa",
        issuing_bank: "",
        credit_limit: 0,
        pin_code: "",
      });
      fetchCards();
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Erreur lors de la mise à jour de la carte");
    }
  };

  const openEditModal = (card: any) => {
    setSelectedCard(card);
    setEditForm({
      card_number: card.card_number || "",
      expiry_date: card.expiry_date || "",
      cvv: card.cvv || "",
      cardholder_name: card.cardholder_name || "",
      card_type: card.card_type || "visa",
      issuing_bank: card.issuing_bank || "",
      credit_limit: card.credit_limit || 0,
      pin_code: card.pin_code || "",
    });
    setIsEditModalOpen(true);
  };

  const handleTopUp = async () => {
    if (!selectedCard) return;

    try {
      await topUpCardBalance(selectedCard.id, balanceForm);
      toast.success("Rechargement effectué avec succès !");
      setIsBalanceModalOpen(false);
      setBalanceForm({ amount: 0, currency: "XOF" });
      fetchCards();
    } catch (error) {
      console.error("Error topping up balance:", error);
      toast.error("Erreur lors du rechargement");
    }
  };

  const handleStatusChange = async (cardId: string, status: string) => {
    try {
      await updateCardStatus(cardId, status as any);
      toast.success(`Statut de carte mis à jour : ${status}`);
      fetchCards();
    } catch (error) {
      console.error("Error updating card status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette carte ?")) return;

    try {
      await deleteBankCard(cardId);
      toast.success("Carte supprimée avec succès !");
      fetchCards();
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Erreur lors de la suppression de la carte");
    }
  };

  const toggleCardNumberVisibility = (cardId: string) => {
    // Si le numéro est déjà affiché, le cacher
    if (showCardNumbers[cardId]) {
      setShowCardNumbers((prev) => ({
        ...prev,
        [cardId]: false,
      }));
    } else {
      // Si on veut afficher le numéro, demander le PIN
      setCardToReveal(cardId);
      setIsPinModalOpen(true);
    }
  };

  const verifyPinAndRevealCard = () => {
    if (!cardToReveal || !pinInput) {
      toast.error("Veuillez saisir votre code PIN");
      return;
    }

    // Trouver la carte correspondante
    const card = cards.find((c) => c.id === cardToReveal);
    if (!card) {
      toast.error("Carte introuvable");
      return;
    }

    // Vérifier le PIN
    if (pinInput !== card.pin_code) {
      toast.error("Code PIN incorrect");
      setPinInput("");
      return;
    }

    // PIN correct, révéler le numéro
    setShowCardNumbers((prev) => ({
      ...prev,
      [cardToReveal]: true,
    }));

    // Fermer le modal et réinitialiser
    setIsPinModalOpen(false);
    setPinInput("");
    setCardToReveal(null);
    toast.success("Numéro de carte révélé");
  };

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return "****";
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "blocked":
        return "bg-red-500";
      case "expired":
        return "bg-gray-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "blocked":
        return "Bloquée";
      case "expired":
        return "Expirée";
      case "pending":
        return "En attente";
      default:
        return "Inconnu";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        {cards.length === 0 && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une carte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle carte</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card_number">Numéro de carte</Label>
                  <Input
                    id="card_number"
                    placeholder="1234 5678 9012 3456"
                    value={createForm.card_number}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        card_number: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry_date">Date d'expiration</Label>
                    <Input
                      id="expiry_date"
                      placeholder="MM/YY"
                      value={createForm.expiry_date}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          expiry_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={createForm.cvv}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          cvv: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardholder_name">Nom du porteur</Label>
                  <Input
                    id="cardholder_name"
                    placeholder="JOHN DOE"
                    value={createForm.cardholder_name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        cardholder_name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="card_type">Type de carte</Label>
                  <Select
                    value={createForm.card_type}
                    onValueChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, card_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">MasterCard</SelectItem>
                      <SelectItem value="american_express">
                        American Express
                      </SelectItem>
                      <SelectItem value="discover">Discover</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issuing_bank">Banque émettrice</Label>
                  <Input
                    id="issuing_bank"
                    placeholder="Nom de la banque"
                    value={createForm.issuing_bank}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        issuing_bank: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="pin_code">Code PIN</Label>
                  <Input
                    id="pin_code"
                    type="password"
                    placeholder="****"
                    maxLength={4}
                    value={createForm.pin_code}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        pin_code: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="initialBalance">Solde initial</Label>
                    <Input
                      id="initialBalance"
                      type="number"
                      placeholder="0"
                      value={createForm.initialBalance}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          initialBalance: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Select
                      value={createForm.currency}
                      onValueChange={(value) =>
                        setCreateForm((prev) => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XOF">XOF (FCFA)</SelectItem>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.id}
                            value={currency.currency}
                          >
                            {currency.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleCreateCard}>Créer la carte</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Liste des cartes */}
      <div className="grid gap-4">
        {cards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Aucune carte bancaire trouvée
              </p>
              <p className="text-gray-400 text-sm text-center mt-2">
                Cliquez sur "Ajouter une carte" pour commencer
              </p>
            </CardContent>
          </Card>
        ) : (
          cards.map((card) => (
            <Card key={card.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle className="text-base">
                    {card.cardholder_name || "Carte sans nom"}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={`${getStatusColor(card.status)} text-white`}
                  >
                    {getStatusText(card.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Numéro de carte
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardNumberVisibility(card.id)}
                      >
                        {showCardNumbers[card.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="font-mono">
                      {showCardNumbers[card.id]
                        ? card.card_number
                        : maskCardNumber(card.card_number)}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Expiration
                        </p>
                        <p>{card.expiry_date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="capitalize">{card.card_type}</p>
                      </div>
                    </div>

                    {card.issuing_bank && (
                      <div>
                        <p className="text-sm text-muted-foreground">Banque</p>
                        <p>{card.issuing_bank}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">
                        Solde disponible
                      </p>
                      <p className="text-2xl font-bold">
                        {Number(card.balance).toLocaleString("fr-FR")} XOF
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCard(card);
                          setIsBalanceModalOpen(true);
                        }}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Gérer solde
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(card)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>

                      {card.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(card.id, "blocked")}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Bloquer
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(card.id, "active")}
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Débloquer
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de gestion du solde */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gérer le solde</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Solde actuel</p>
              <p className="text-xl font-bold">
                {selectedCard
                  ? Number(selectedCard.balance).toLocaleString("fr-FR")
                  : 0}{" "}
                XOF
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={balanceForm.amount}
                  onChange={(e) =>
                    setBalanceForm((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={balanceForm.currency}
                  onValueChange={(value) =>
                    setBalanceForm((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">XOF (FCFA)</SelectItem>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.currency}>
                        {currency.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsBalanceModalOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleTopUp}>Recharger (+)</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de modification de carte */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier les informations de la carte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_card_number">Numéro de carte</Label>
              <Input
                id="edit_card_number"
                placeholder="1234 5678 9012 3456"
                value={editForm.card_number}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    card_number: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_expiry_date">Date d'expiration</Label>
                <Input
                  id="edit_expiry_date"
                  placeholder="MM/YY"
                  value={editForm.expiry_date}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      expiry_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_cvv">CVV</Label>
                <Input
                  id="edit_cvv"
                  placeholder="123"
                  value={editForm.cvv}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      cvv: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_cardholder_name">Nom du porteur</Label>
              <Input
                id="edit_cardholder_name"
                placeholder="JOHN DOE"
                value={editForm.cardholder_name}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    cardholder_name: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="edit_card_type">Type de carte</Label>
              <Select
                value={editForm.card_type}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, card_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">MasterCard</SelectItem>
                  <SelectItem value="american_express">
                    American Express
                  </SelectItem>
                  <SelectItem value="discover">Discover</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit_issuing_bank">Banque émettrice</Label>
              <Input
                id="edit_issuing_bank"
                placeholder="Nom de la banque"
                value={editForm.issuing_bank}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    issuing_bank: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="edit_credit_limit">Limite de crédit</Label>
              <Input
                id="edit_credit_limit"
                type="number"
                placeholder="0"
                value={editForm.credit_limit}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    credit_limit: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="edit_pin_code">Code PIN</Label>
              <Input
                id="edit_pin_code"
                type="password"
                placeholder="****"
                value={editForm.pin_code}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    pin_code: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleEditCard}>Modifier</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de saisie du PIN pour révéler le numéro de carte */}
      <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Saisir votre code PIN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Pour afficher le numéro complet de votre carte, veuillez saisir
              votre code PIN.
            </p>

            <div>
              <Label htmlFor="pin">Code PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="****"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={4}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    verifyPinAndRevealCard();
                  }
                }}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPinInput("");
                  setCardToReveal(null);
                }}
              >
                Annuler
              </Button>
              <Button onClick={verifyPinAndRevealCard}>
                Révéler le numéro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
