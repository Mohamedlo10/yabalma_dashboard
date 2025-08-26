import React from "react";
import { getWalletByUserId } from "@/app/api/wallets/query";

// Event personnalisé pour notifier les mises à jour de wallet
const WALLET_UPDATE_EVENT = "walletBalanceUpdate";

interface WalletUpdateDetail {
  userId: string;
  newBalance: number;
}

// Fonction pour déclencher une mise à jour du wallet
export const triggerWalletRefresh = (userId: string, newBalance?: number) => {
  const event = new CustomEvent(WALLET_UPDATE_EVENT, {
    detail: { userId, newBalance },
  });
  window.dispatchEvent(event);
};

// Hook pour écouter les mises à jour de wallet
export const useWalletRefresh = (
  onBalanceUpdate: (balance: number) => void
) => {
  React.useEffect(() => {
    const handleWalletUpdate = (event: CustomEvent<WalletUpdateDetail>) => {
      const { newBalance } = event.detail;
      if (newBalance !== undefined) {
        onBalanceUpdate(newBalance);
      }
    };

    window.addEventListener(
      WALLET_UPDATE_EVENT,
      handleWalletUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        WALLET_UPDATE_EVENT,
        handleWalletUpdate as EventListener
      );
    };
  }, [onBalanceUpdate]);
};

// Fonction utilitaire pour rafraîchir le solde depuis l'API
export const refreshWalletFromAPI = async (userId: string): Promise<number> => {
  try {
    const wallet = await getWalletByUserId(userId);
    const balance = wallet?.balance || 0;

    // Déclencher l'événement de mise à jour
    triggerWalletRefresh(userId, balance);

    return balance;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du wallet:", error);
    throw error;
  }
};
