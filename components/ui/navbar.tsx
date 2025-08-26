"use client";
import Image from "next/image";
import { CSSProperties, useState } from "react";
import { Role } from "@/app/dashboard/settings/schema";
import { useEffect } from "react";
import { getSupabaseSession, getSupabaseUser } from "@/lib/authMnager";
import { getAllUserInfo } from "@/app/api/auth/query";
import { getOrCreateUserWallet } from "@/app/api/wallets/query";
import { useWalletRefresh } from "@/hooks/use-wallet-refresh";
import BeatLoader from "react-spinners/BeatLoader";
import { LogIn, User, Wallet } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  toggleSidebar: () => void;
}

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

// Fonctions de cache pour les données utilisateur
const CACHE_KEYS = {
  WALLET_BALANCE: "yabalma_wallet_balance",
  USER_INFO: "yabalma_user_info",
  LAST_WALLET_UPDATE: "yabalma_wallet_update",
};

const getCachedWalletBalance = (userId: string): number | null => {
  try {
    const cached = localStorage.getItem(
      `${CACHE_KEYS.WALLET_BALANCE}_${userId}`
    );
    const lastUpdate = localStorage.getItem(
      `${CACHE_KEYS.LAST_WALLET_UPDATE}_${userId}`
    );

    if (cached && lastUpdate) {
      const updateTime = parseInt(lastUpdate);
      const now = Date.now();
      // Cache valide pendant 30 secondes
      if (now - updateTime < 30000) {
        return parseFloat(cached);
      }
    }
    return null;
  } catch {
    return null;
  }
};

const setCachedWalletBalance = (userId: string, balance: number): void => {
  try {
    localStorage.setItem(
      `${CACHE_KEYS.WALLET_BALANCE}_${userId}`,
      balance.toString()
    );
    localStorage.setItem(
      `${CACHE_KEYS.LAST_WALLET_UPDATE}_${userId}`,
      Date.now().toString()
    );
  } catch (error) {
    console.warn("Erreur lors du cache du wallet:", error);
  }
};

const getCachedUserInfo = (): any | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.USER_INFO);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCachedUserInfo = (userInfo: any): void => {
  try {
    localStorage.setItem(CACHE_KEYS.USER_INFO, JSON.stringify(userInfo));
  } catch (error) {
    console.warn("Erreur lors du cache des infos utilisateur:", error);
  }
};

function Navbar({ toggleSidebar }: NavbarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role>();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletUser, setWalletUser] = useState<any>(null);
  let [color, setColor] = useState("#ffffff");

  // Hook pour écouter les mises à jour de wallet
  useWalletRefresh((newBalance: number) => {
    setWalletBalance(newBalance);
    if (userInfo?.id) {
      setCachedWalletBalance(userInfo.id, newBalance);
    }
  });

  // Function to refresh wallet balance
  const refreshWalletBalance = async (forceRefresh: boolean = false) => {
    if (!userInfo?.id) {
      // console.log("❌ Pas d'ID utilisateur disponible pour récupérer le solde");
      return;
    }

    // console.log(`🔍 Récupération du solde pour l'utilisateur: ${userInfo.id}`);

    try {
      // Vérifier le cache d'abord si pas de refresh forcé
      if (!forceRefresh) {
        const cachedBalance = getCachedWalletBalance(userInfo.id);
        if (cachedBalance !== null) {
          /* console.log(
            `📦 Solde récupéré depuis le cache: ${cachedBalance} XOF`
          ); */
          setWalletBalance(cachedBalance);
          return;
        }
      }

      // console.log("🌐 Récupération du solde depuis l'API...");
      // Récupérer depuis l'API (ou créer le wallet s'il n'existe pas)
      const wallet = await getOrCreateUserWallet(userInfo.id);
      // console.log("📊 Réponse de l'API wallet:", wallet);

      const newBalance = wallet?.balance || 0;

      setWalletBalance(newBalance);
      setCachedWalletBalance(userInfo.id, newBalance);

      // console.log(`💰 Solde mis à jour: ${newBalance} XOF`);
    } catch (error) {
      console.error("❌ Error refreshing wallet balance:", error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Récupérer les données de session depuis les cookies
        const sessionRole = getSupabaseSession();
        const sessionUser = getSupabaseUser();

        setRole(sessionRole);

        if (sessionRole) {
          let userDetails = sessionUser;

          // Si pas d'infos utilisateur en cookies, les récupérer de l'API
          if (!userDetails) {
            try {
              userDetails = await getAllUserInfo();
              // console.log("🔄 Infos utilisateur récupérées depuis l'API");
            } catch (apiError) {
              console.error(
                "Erreur API lors de la récupération des infos utilisateur:",
                apiError
              );
            }
          } else {
            // console.log("✅ Infos utilisateur récupérées depuis les cookies");
          }

          if (userDetails?.id) {
            setUserInfo(userDetails);
            setCachedUserInfo(userDetails);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Effet séparé pour rafraîchir le solde quand userInfo est disponible
  useEffect(() => {
    if (userInfo?.id) {
      /* console.log(
        `🔄 Récupération du solde pour l'utilisateur: ${userInfo.id}`
      ); */
      refreshWalletBalance(false); // false = utiliser le cache si disponible
    }
  }, [userInfo]);

  // Rafraîchir le solde toutes les 10 secondes depuis la base de données
  useEffect(() => {
    if (!userInfo?.id) return;
    const interval = setInterval(() => {
      refreshWalletBalance(true); // true = forcer le refresh depuis l'API
    }, 10000);
    return () => clearInterval(interval);
  }, [userInfo]);

  // Récupération du wallet utilisateur
  useEffect(() => {
    async function fetchWallet() {
      if (userInfo?.id) {
        const wallet = await getOrCreateUserWallet(userInfo.id);
        setWalletUser(wallet && wallet.id ? wallet : null);
        setIsLoading(false);
      } else {
        setWalletUser(null);
      }
    }
    fetchWallet();
  }, [userInfo]);

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
    <div className="flex flex-col">
      <header className="flex items-center md:items-center gap-4 border-b bg-white px-10 h-[8vh] md:h-[5vh]">
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex items-center justify-center text-gray-700 hover:text-red-700"
          aria-label="Toggle sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="w-full">
          <div className="relative">
            {!role ? (
              <Link
                href="/"
                className={`flex items-center gap-2 w-1/3 rounded-md px-2 py-1.5 font-medium text-base transition-all text-red-700 hover:bg-red-700 hover:text-white`}
              >
                <LogIn className="h-5 w-5 flex-shrink-0" />
                <span className={`transition-opacity duration-300`}>
                  Veuillez Vous Connectez
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-4 rounded-md px-2 py-1.5">
                {/* User Info */}
                <div className="flex items-center gap-2 font-medium text-base transition-all text-red-700 hover:bg-red-700 hover:text-white rounded-md px-2 py-1">
                  <User className="h-5 w-5 flex-shrink-0" />
                  <span className="transition-opacity duration-300">
                    {userInfo?.user_metadata?.prenom || "Prénom"}{" "}
                    {userInfo?.user_metadata?.nom || role.nom || "Nom"}
                  </span>
                </div>

                {/* Wallet Balance */}
                {walletUser && walletUser.id ? (
                  <div className="flex items-center gap-2 font-medium text-base transition-all text-green-700 hover:bg-green-700 hover:text-white rounded-md px-2 py-1">
                    <Wallet className="h-5 w-5 flex-shrink-0" />
                    <span className="transition-opacity duration-300">
                      {walletBalance.toLocaleString()} XOF
                    </span>
                  </div>
                ) : (
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 font-medium text-base bg-green-100 text-green-700 hover:bg-green-700 hover:text-white rounded-md px-2 py-1"
                  >
                    <Wallet className="h-5 w-5 flex-shrink-0" />
                    <span className="transition-opacity duration-300">
                      Créer mon portefeuille
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-8 items-center gap-8 h-22 w-60">
          <div className="col-span-6 flex flex-row items-center justify-center gap-4 h-1/3 rounded-xl">
            <Image
              src="/logoYabalma.svg"
              alt="Image"
              width={70}
              height={70}
              className="h-full w-full object-cover rounded-2xl dark:brightness-[0.2] dark:grayscale"
            />
            <div className="items-center justify-center h-full text-black flex">
              YABALMA
            </div>
          </div>
          {/* <div className="col-span-2"></div> */}
        </div>
      </header>
    </div>
  );
}

export default Navbar;
