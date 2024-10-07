"use client";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  ChevronDown,
  ChevronUp,
  Hand,
  Home,
  LineChart,
  Package2,
  Settings,
  ShoppingCart,
  Text,
  User,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function Sidebar() {
  const pathname = usePathname();
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  useEffect(() => {
    // Fermer le sous-menu lorsque le chemin change
    if (!pathname.startsWith("/dashboard/utilisateurs")) {
      setIsSubMenuOpen(false);
    }
  }, [pathname]);

  return (
    <div className="h-full">
      <div className="flex h-[8vh] items-center border-b px-4 lg:h-22 lg:px-6">
        <Link href="/" className="flex items-center gap-4 font-semibold">
          <Package2 className="h-8 w-8 p-2 bg-white text-red-700 rounded-full" />
          <span className="text-white font-bold">YABALMA</span>
        </Link>
      </div>

      <div className="relative top-8">
        <nav className="grid gap-1 items-start text-sm font-medium lg:px-6">
          <div className="px-1 font-bold text-gray-100 pb-3">MENU</div>

          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
              pathname === "/dashboard"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Home className="h-8 w-4" />
            Dashboard
          </Link>

          {/* Lien principal "Utilisateurs" */}
          <div>
            <Link
              href="#"
              onClick={toggleSubMenu}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
                isSubMenuOpen ? "bg-white text-red-700 shadow-lg" : "text-white hover:bg-white hover:text-red-700"
              }`}
            >
              <Users className="h-8 w-4" />
              Utilisateurs
              {isSubMenuOpen ? <ChevronUp className="ml-auto" /> : <ChevronDown className="ml-auto" />}
            </Link>

            {/* Sous-liens */}
            {isSubMenuOpen && (
              <div className="ml-8 mt-2 flex flex-col space-y-2">
                <Link
                  href="/dashboard/utilisateurs"
                  className={`font-bold rounded-lg px-3 py-2 transition-all ${
                    pathname === "/dashboard/utilisateurs"
                      ? "bg-white text-red-700"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  Accueil
                </Link>
                <Link
                  href="/dashboard/utilisateurs/Clients"
                  className={`font-bold rounded-lg px-3 py-2 transition-all ${
                    pathname === "/dashboard/utilisateurs/Clients"
                      ? "bg-white text-red-700"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  Clients
                </Link>
                <Link
                  href="/dashboard/utilisateurs/gp"
                  className={`font-bold rounded-lg px-3 py-2 transition-all ${
                    pathname === "/dashboard/utilisateurs/gp"
                      ? "bg-white text-red-700"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  GP
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/dashboard/annonces"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
              pathname === "/dashboard/annonces"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Book className="h-8 w-4" />
            Annonces
          </Link>

          <Link
            href="/dashboard/commandes"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
              pathname === "/dashboard/commandes"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <ShoppingCart className="h-8 w-4" />
            Commandes
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              6
            </Badge>
          </Link>

          <Link
            href="/finances"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
              pathname === "/finances"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <LineChart className="h-8 w-4" />
            Finances
          </Link>

          <Link
            href="/feedback"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
              pathname === "/feedback"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Text className="h-8 w-4" />
            Feedback
          </Link>
        </nav>
      </div>

      <div className="relative top-24">
        <nav className="grid gap-1 items-start px-1 text-sm font-medium lg:px-6">
          <div className="px-1 font-bold text-gray-100 pb-3">OTHERS</div>

          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
              pathname === "/settings"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Settings className="h-8 w-4" />
            Settings
          </Link>

          <Link
            href="/account"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
              pathname === "/account"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <User className="h-8 w-4" />
            Account
          </Link>

          <Link
            href="/help"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold transition-all ${
              pathname === "/help"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Hand className="h-8 w-4" />
            Help
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
