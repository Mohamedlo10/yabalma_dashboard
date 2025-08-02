"use client";
import { userDeConnection } from "@/app/api/auth/query";
import { Role } from "@/app/dashboard/settings/schema";
import { getSupabaseSession } from "@/lib/authMnager";
import {
  Book,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Edit,
  Home,
  LineChart,
  LogOut,
  Menu,
  Package2,
  Settings,
  ShoppingCart,
  Text,
  User,
  Users,
  X,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import ConfirmDialog from "./dialogConfirm";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export const paths = [
  "utilisateurs",
  "annonces",
  "commandes",
  "commentaires",
  "finance",
  "settings",
  "accounts",
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isHovered?: boolean;
}

function Sidebar({ isOpen, toggleSidebar, isHovered = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role>();
  let [color, setColor] = useState("#ffffff");
  const [error, setError] = useState("");

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const handleNavigation = () => {
    router.push(`/`);
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        setRole(getSupabaseSession());
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/dashboard/utilisateurs")) {
      setIsSubMenuOpen(false);
    }
    if (!pathname.startsWith("/dashboard/annonces")) {
      setIsSubMenuOpen(false);
    }
  }, [pathname]);

  const handleLogOut = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error }: any = await userDeConnection();
      if (error) {
        setError(error.message);
      } else {
        handleNavigation();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
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

  return role?.access_groups ? (
    <div className="h-screen w-full bg-red-700 flex flex-col">
      {/* Header - hauteur minimale */}
      <div className="flex justify-between items-center h-14 px-3 border-b border-red-600 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Package2 className="h-7 w-7 p-1 bg-white text-red-700 rounded-lg shadow-sm" />
          <span
            className={`text-white font-bold text-base transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "lg:opacity-0"
            }`}
          >
            YABALMA
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-white hover:text-gray-200 p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation - distribution améliorée */}
      <div className="flex-1 flex flex-col py-2">
        {/* Section MENU - prend l'espace disponible */}
        <nav className="px-2 space-y-0.5 flex-1">
          <div
            className={`px-1 font-bold text-gray-100 text-xs mb-2 transition-opacity duration-300 `}
          >
            MENU
          </div>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
              pathname === "/dashboard"
                ? "bg-white text-red-700 shadow-sm"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            <span
              className={`transition-opacity duration-300 ${
                isHovered ? "block" : "lg:hidden"
              }`}
            >
              Dashboard
            </span>
          </Link>

          {/* Utilisateurs */}
          {role?.access_groups.utilisateurs && (
            <div>
              <button
                onClick={toggleSubMenu}
                className={`flex items-center justify-between w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                  pathname === "/dashboard/utilisateurs" ||
                  pathname === "/dashboard/utilisateurs/gp" ||
                  pathname === "/dashboard/utilisateurs/Clients" ||
                  isSubMenuOpen
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`transition-opacity duration-300 ${
                      isHovered ? "block" : "lg:hidden"
                    }`}
                  >
                    Utilisateurs
                  </span>
                </div>
                {isSubMenuOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {isSubMenuOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  <Link
                    href="/dashboard/utilisateurs"
                    className={`block rounded-md px-2 py-1 text-xs transition-all ${
                      pathname === "/dashboard/utilisateurs"
                        ? "bg-white text-red-700"
                        : "text-white hover:bg-white hover:text-red-700"
                    }`}
                  >
                    Accueil
                  </Link>
                  <Link
                    href="/dashboard/utilisateurs/Clients"
                    className={`block rounded-md px-2 py-1 text-xs transition-all ${
                      pathname === "/dashboard/utilisateurs/Clients" ||
                      pathname === "/dashboard/utilisateurs/Clients/profile"
                        ? "bg-white text-red-700"
                        : "text-white hover:bg-white hover:text-red-700"
                    }`}
                  >
                    Clients
                  </Link>
                  <Link
                    href="/dashboard/utilisateurs/gp"
                    className={`block rounded-md px-2 py-1 text-xs transition-all ${
                      pathname === "/dashboard/utilisateurs/gp" ||
                      pathname === "/dashboard/utilisateurs/gp/profile"
                        ? "bg-white text-red-700"
                        : "text-white hover:bg-white hover:text-red-700"
                    }`}
                  >
                    GP
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Annonces */}
          {role?.access_groups.annonces && (
            <div>
              <button
                onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
                className={`flex items-center justify-between w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                  pathname === "/dashboard/annonces" ||
                  pathname === "/dashboard/annonces/profile" ||
                  pathname === "/dashboard/annonces/gestion" ||
                  isSubMenuOpen
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`transition-opacity duration-300 ${
                      isHovered ? "block" : "lg:hidden"
                    }`}
                  >
                    Annonces
                  </span>
                </div>
                {isSubMenuOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {isSubMenuOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  <Link
                    href="/dashboard/annonces"
                    className={`block rounded-md px-2 py-1 text-xs transition-all ${
                      pathname === "/dashboard/annonces" ||
                      pathname === "/dashboard/annonces/profile"
                        ? "bg-white text-red-700"
                        : "text-white hover:bg-white hover:text-red-700"
                    }`}
                  >
                    Accueil
                  </Link>
                  <Link
                    href="/dashboard/annonces/gestion"
                    className={`block rounded-md px-2 py-1 text-xs transition-all ${
                      pathname === "/dashboard/annonces/gestion"
                        ? "bg-white text-red-700"
                        : "text-white hover:bg-white hover:text-red-700"
                    }`}
                  >
                    Gestion Annonce
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Commandes */}
          {role?.access_groups.commandes && (
            <>
              <Link
                href="/dashboard/commandes"
                className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                  pathname === "/dashboard/commandes" ||
                  pathname === "/dashboard/commandes/profile"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <ShoppingCart className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`transition-opacity duration-300 ${
                    isHovered ? "block" : "lg:hidden"
                  }`}
                >
                  Commandes
                </span>
              </Link>

              <Link
                href="/dashboard/validation"
                className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                  pathname === "/dashboard/validation" ||
                  pathname === "/dashboard/validation/profile"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`transition-opacity duration-300 ${
                    isHovered ? "block" : "lg:hidden"
                  }`}
                >
                  À valider
                </span>
              </Link>
            </>
          )}

          {/* Finance */}
          {role?.access_groups.finance && (
            <Link
              href="/dashboard/finance"
              className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                pathname === "/dashboard/finance"
                  ? "bg-white text-red-700 shadow-sm"
                  : "text-white hover:bg-white hover:text-red-700"
              }`}
            >
              <LineChart className="h-5 w-5 flex-shrink-0" />
              <span
                className={`transition-opacity duration-300 ${
                  isHovered ? "block" : "lg:hidden"
                }`}
              >
                Finances
              </span>
            </Link>
          )}

          {/* Commentaires */}
          {role?.access_groups.commentaires && (
            <Link
              href="/dashboard/commentaires"
              className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                pathname === "/dashboard/commentaires"
                  ? "bg-white text-red-700 shadow-sm"
                  : "text-white hover:bg-white hover:text-red-700"
              }`}
            >
              <Text className="h-5 w-5 flex-shrink-0" />
              <span
                className={`transition-opacity duration-300 ${
                  isHovered ? "block" : "lg:hidden"
                }`}
              >
                Commentaires
              </span>
            </Link>
          )}
        </nav>

        {/* Section OTHERS - position fixe en bas */}
        <nav className="px-2 space-y-0.5 mt-4">
          <div
            className={`px-1 font-bold text-gray-100 text-xs mb-2 transition-opacity duration-300 `}
          >
            OTHERS
          </div>

          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
              pathname === "/dashboard/profile"
                ? "bg-white text-red-700 shadow-sm"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <User className="h-5 w-5 flex-shrink-0" />
            <span
              className={`transition-opacity duration-300 ${
                isHovered ? "block" : "lg:hidden"
              }`}
            >
              Profile
            </span>
          </Link>

          {role?.access_groups.accounts && (
            <Link
              href="/dashboard/accounts"
              className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                pathname === "/dashboard/accounts" ||
                pathname === "/dashboard/accounts/profile"
                  ? "bg-white text-red-700 shadow-sm"
                  : "text-white hover:bg-white hover:text-red-700"
              }`}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <span
                className={`transition-opacity duration-300 ${
                  isHovered ? "block" : "lg:hidden"
                }`}
              >
                Comptes
              </span>
            </Link>
          )}

          {role?.access_groups.settings && (
            <>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                  pathname === "/dashboard/settings"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`transition-opacity duration-300 ${
                    isHovered ? "block" : "lg:hidden"
                  }`}
                >
                  Paramètres
                </span>
              </Link>

              <Link
                href="/dashboard/currency"
                className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all ${
                  pathname === "/dashboard/currency"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <DollarSign className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`transition-opacity duration-300 ${
                    isHovered ? "block" : "lg:hidden"
                  }`}
                >
                  Devises
                </span>
              </Link>
            </>
          )}

          <button
            onClick={() => setDialogOpen(true)}
            className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 font-medium text-sm transition-all text-white hover:bg-white hover:text-red-700`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span
              className={`transition-opacity duration-300 ${
                isHovered ? "block" : "lg:hidden"
              }`}
            >
              Déconnexion
            </span>
          </button>
        </nav>
      </div>

      <ConfirmDialog
        isOpen={isDialogOpen}
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        onConfirm={() => {
          handleLogOut();
          setDialogOpen(false);
        }}
        onCancel={() => setDialogOpen(false)}
      />
    </div>
  ) : (
    <div></div>
  );
}

export default Sidebar;
