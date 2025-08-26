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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  createWallet,
  getWalletByUserId,
  updateWalletBalance,
  getOrCreateUserWallet,
  createBankCard,
  BankCardData,
} from "@/app/api/wallets/query";
import { getAllCurrency } from "@/app/api/currency/query";
import { getSupabaseSession, getSupabaseUser } from "@/lib/authMnager";
import { triggerWalletRefresh } from "@/hooks/use-wallet-refresh";
import { Loader2, CreditCard, Plus, Wallet } from "lucide-react";
import { BankCardManager } from "./bank-card-manager";

export function WalletCard({ userId }: { userId: string }) {
  const [wallet, setWallet] = useState<any>(null);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const walletData = await getWalletByUserId(userId);
        setWallet(walletData);
      } catch (error) {
        console.error("Error fetching wallet:", error);
        // Ne pas afficher d'erreur car c'est normal de ne pas avoir de wallet au début
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

    const fetchUserEmail = async () => {
      try {
        const session = await getSupabaseUser();
        if (session?.email) {
          console.log(session.email);
          setUserEmail(session.email);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };

    fetchWallet();
    fetchCurrencies();
    fetchUserEmail();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <BankCardManager userId={userId} userEmail={userEmail} />
    </div>
  );
}
