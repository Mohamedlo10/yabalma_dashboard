"use client";
import { userDeConnection } from "@/app/api/auth/query";
import { Role } from "@/app/dashboard/settings/schema";
import { getSupabaseSession } from "@/lib/authMnager";
import {
  Book,
  ChevronDown,
  ChevronUp,
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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import ConfirmDialog from "./dialogConfirm";
import { UpdateIcon } from "@radix-ui/react-icons";
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
}

function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
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
    <div
      className={`h-screen ${
        isOpen ? "w-full" : "w-0 lg:w-full"
      } transition-all duration-300 overflow-hidden`}
    >
      <div className="flex justify-between h-[14vh] lg:h-[8vh] py-2 items-center border-b px-4 lg:h-22 lg:px-6">
        <div className="flex items-center gap-4 font-semibold">
          <Package2 className="2xl:h-6 lg w-8 p-2 bg-white text-red-700 rounded-full" />
          <span className="text-white font-bold">YABALMA</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-white hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>
      <div className="h-[90%] overflow-y-auto">
        <div className="relative top-8">
          <nav className="grid gap-1 items-start text-sm font-medium  px-3 lg:px-3 xl:px-6">
            <div className="px-1 font-bold text-gray-100 pb-3">MENU</div>

            <Link
              href="/dashboard"
              className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                pathname === "/dashboard"
                  ? "bg-white text-red-700 shadow-lg"
                  : "text-white hover:bg-white hover:text-red-700"
              }`}
            >
              <Home className="2xl:h-6 h-4 w-4" />
              Dashboard
            </Link>

            {role?.access_groups.utilisateurs ? (
              <div>
                <Link
                  href="#"
                  onClick={toggleSubMenu}
                  className={`flex items-center gap-1 lg:gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                    pathname === "/dashboard/utilisateurs" ||
                    pathname === "/dashboard/utilisateurs/gp" ||
                    pathname === "/dashboard/utilisateurs/Clients" ||
                    isSubMenuOpen
                      ? "bg-white text-red-700 shadow-lg"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  <Users className="2xl:h-6 lg w-4" />
                  Utilisateurs
                  {isSubMenuOpen ? (
                    <ChevronUp className="ml-auto" />
                  ) : (
                    <ChevronDown className="ml-auto" />
                  )}
                </Link>

                {/* Sous-liens */}
                {isSubMenuOpen && (
                  <div className="ml-8 mt-2 flex flex-col space-y-2">
                    <Link
                      href="/dashboard/utilisateurs"
                      className={`font-bauto rounded-lg lg:px-3  px-3 py-2 transition-all ${
                        pathname === "/dashboard/utilisateurs"
                          ? "bg-white text-red-700"
                          : "text-white hover:bg-white hover:text-red-700"
                      }`}
                    >
                      Accueil
                    </Link>
                    <Link
                      href="/dashboard/utilisateurs/Clients"
                      className={`font-bauto rounded-lg lg:px-3  px-3 py-2 transition-all ${
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
                      className={`font-bauto rounded-lg lg:px-3  px-3 py-2 transition-all ${
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
            ) : (
              <div></div>
            )}

            {/* Rest of the sidebar menu items */}
            {role?.access_groups.annonces ? (
              <Link
                href="/dashboard/annonces"
                className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                  pathname === "/dashboard/annonces" ||
                  pathname === "/dashboard/annonces/profile"
                    ? "bg-white text-red-700 shadow-lg"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <Book className="2xl:h-6 lg w-4" />
                Annonces
              </Link>
            ) : (
              <div></div>
            )}

            {/* Other menu items... */}
            {/* Rest of your existing menu items */}

            {role?.access_groups.commandes ? (
              <>
                <Link
                  href="/dashboard/commandes"
                  className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                    pathname === "/dashboard/commandes" ||
                    pathname === "/dashboard/commandes/profile"
                      ? "bg-white text-red-700 shadow-lg"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  <ShoppingCart className="2xl:h-6 lg w-4" />
                  Commandes
                </Link>
                <Link
                  href="/dashboard/validation"
                  className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                    pathname === "/dashboard/validation" ||
                    pathname === "/dashboard/validation/profile"
                      ? "bg-white text-red-700 shadow-lg"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  <UpdateIcon className="2xl:h-6 lg w-4" />A valider
                </Link>
              </>
            ) : (
              <div></div>
            )}

            {role?.access_groups.finance ? (
              <Link
                href="/dashboard/finance"
                className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                  pathname === "/dashboard/finance"
                    ? "bg-white text-red-700 shadow-lg"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <LineChart className="2xl:h-6 lg w-4" />
                Finances
              </Link>
            ) : (
              <div></div>
            )}

            {role?.access_groups.commentaires ? (
              <Link
                href="/dashboard/commentaires"
                className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                  pathname === "/dashboard/commentaires"
                    ? "bg-white text-red-700 shadow-lg"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <Text className="2xl:h-6 lg w-4" />
                Commentaires
              </Link>
            ) : (
              <div></div>
            )}
          </nav>
        </div>

        <div className="relative 2xl:top-24 top-16">
          <nav className="grid gap-1 items-start pb-4 text-sm font-medium px-1 lg:px-3 xl:px-6">
            <div className="px-1 font-bold text-gray-100 pb-3">OTHERS</div>

            <Link
              href="/dashboard/profile"
              className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                pathname === "/dashboard/profile"
                  ? "bg-white text-red-700 shadow-lg"
                  : "text-white hover:bg-white hover:text-red-700"
              }`}
            >
              <User className="2xl:h-6 lg w-4" />
              Profile
            </Link>

            {role?.access_groups.accounts ? (
              <Link
                href="/dashboard/accounts"
                className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                  pathname === "/dashboard/accounts" ||
                  pathname === "/dashboard/accounts/profile"
                    ? "bg-white text-red-700 shadow-lg"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <Users className="2xl:h-6 lg w-4" />
                Comptes
              </Link>
            ) : (
              <div></div>
            )}

            {role?.access_groups.settings ? (
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                  pathname === "/dashboard/settings"
                    ? "bg-white text-red-700 shadow-lg"
                    : "text-white hover:bg-white hover:text-red-700"
                }`}
              >
                <Settings className="2xl:h-6 lg w-4" />
                Paramètres
              </Link>
            ) : (
              <div></div>
            )}

            <button
              onClick={() => setDialogOpen(true)}
              className={`flex items-center gap-3 w-auto rounded-lg lg:px-3  px-3 py-2 font-bold transition-all ${
                pathname === "/"
                  ? "bg-white text-red-700 shadow-lg"
                  : "text-white hover:bg-white hover:text-red-700"
              }`}
            >
              <LogOut className="2xl:h-6 lg w-4" />
              Deconnexion
            </button>
            <ConfirmDialog
              isOpen={isDialogOpen}
              message={`Etes-vous sûr de vouloir-vous deconnecter ?`}
              onConfirm={() => {
                handleLogOut();
                setDialogOpen(false);
              }}
              onCancel={() => setDialogOpen(false)}
            />
          </nav>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}

export default Sidebar;
