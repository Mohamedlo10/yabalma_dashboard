"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  createWallet,
  getWalletByUserId,
  updateWalletBalance,
  getOrCreateUserWallet,
} from "@/app/api/wallets/query";
import { triggerWalletRefresh } from "@/hooks/use-wallet-refresh";
import { Loader2, CreditCard, Plus } from "lucide-react";

export function WalletCard({ userId }: { userId: string }) {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const walletData = await getWalletByUserId(userId);
        setWallet(walletData);
      } catch (error) {
        console.error("Error fetching wallet:", error);
        toast.error("Erreur lors du chargement du portefeuille");
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [userId]);

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);
      // Utiliser getOrCreateUserWallet qui gère automatiquement l'email
      const newWallet = await getOrCreateUserWallet(userId);
      setWallet(newWallet);

      // Déclencher la mise à jour du solde dans la navbar (solde initial = 0)
      triggerWalletRefresh(userId, 0);

      toast.success("Portefeuille créé avec succès !");
      console.log(
        `💰 Nouveau portefeuille créé avec solde: 0 XOF - Notification envoyée à la navbar`
      );
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Erreur lors de la création du portefeuille");
    } finally {
      setIsCreating(false);
    }
  };

  const handleTopUp = async () => {
    const amount = Math.round(parseFloat(topUpAmount));
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    // Convert to bigint for storage (FCFA is already in whole numbers)
    const amountInCents = BigInt(amount);

    try {
      setIsToppingUp(true);
      // In a real app, you would integrate with a payment processor here
      // For now, we'll just update the balance directly
      await updateWalletBalance(wallet.id, amountInCents);

      // Refresh wallet data
      const updatedWallet = await getWalletByUserId(userId);
      setWallet(updatedWallet);

      // Déclencher la mise à jour du solde dans la navbar
      const newBalance = Number(updatedWallet.balance);
      triggerWalletRefresh(userId, newBalance);

      setTopUpAmount("");

      toast.success(
        `Votre portefeuille a été crédité de ${amount.toLocaleString(
          "fr-FR"
        )} FCFA`
      );
      console.log(
        `💰 Solde mis à jour: ${newBalance} XOF - Notification envoyée à la navbar`
      );
    } catch (error) {
      console.error("Error topping up wallet:", error);
      toast.error("Erreur lors du rechargement du portefeuille");
    } finally {
      setIsToppingUp(false);
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
    <Card className="w-full max-w-xl sm:h-auto h-[75vh]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Ma Carte
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!wallet ? (
          <div className="space-y-4">
            <p>Vous n'avez pas encore de portefeuille.</p>
            <Button
              onClick={handleCreateWallet}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer mon portefeuille
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Solde actuel</div>
              <div className="text-2xl font-bold">
                {Number(wallet.balance).toLocaleString("fr-FR")} FCFA
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant à créditer (XOF)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Entrez le montant"
                />
              </div>
              <Button
                onClick={handleTopUp}
                disabled={isToppingUp || !topUpAmount}
                className="w-full"
              >
                {isToppingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Recharger mon portefeuille"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
