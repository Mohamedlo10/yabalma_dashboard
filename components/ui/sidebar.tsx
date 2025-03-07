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
  Package2,
  Settings,
  ShoppingCart,
  Text,
  User,
  Users
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

export const paths = ['utilisateurs','annonces','commandes','commentaires','finance','settings','accounts']
  

function Sidebar() {
const router = useRouter();
  const pathname = usePathname();
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role>();
  let [color, setColor] = useState("#ffffff");
  const [error, setError] = useState('');
  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const handleNavigation = () => {
    router.push(`/`);
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        setRole(getSupabaseSession())
      } catch (error) {
        console.error("Error fetching user details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, []) 

  useEffect(() => {
    if (!pathname.startsWith("/dashboard/utilisateurs")) {
      setIsSubMenuOpen(false);
    }
  }, [pathname]);

  const handleLogOut = async () => {
    setIsLoading(true);
    setError('');
  
    try {
      const { error }: any = await userDeConnection();
      if (error) {
        setError(error.message);
      } else {
        handleNavigation();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
    finally{
      setIsLoading(false)

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

  return (
    role?.access_groups?( <div className="h-[100vh]">
      <div className="flex h-[8vh] items-center border-b px-4 lg:h-22 lg:px-6">
        <div className="flex items-center gap-4 font-semibold">
          <Package2 className="h-8 w-8 p-2 bg-white text-red-700 rounded-full" />
          <span className="text-white font-bold">YABALMA</span>
        </div>
      </div>

      <div className="relative top-8">
        <nav className="grid gap-1 items-start text-sm font-medium px-3 lg:px-6">
          <div className="px-1 font-bold text-gray-100 pb-3">MENU</div>

          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/dashboard"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Home className="h-8 w-4" />
            Dashboard
          </Link>

        { role?.access_groups.utilisateurs?( <div>
            <Link
              href="#"
              onClick={toggleSubMenu}
              className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
                 pathname === "/dashboard/utilisateurs" || pathname === "/dashboard/utilisateurs/gp" || pathname === "/dashboard/utilisateurs/Clients" ||  isSubMenuOpen ? "bg-white text-red-700 shadow-lg" : "text-white hover:bg-white hover:text-red-700"
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
                  className={`font-bold rounded-lg lg:px-3 px-2 py-2 transition-all ${
                    pathname === "/dashboard/utilisateurs"
                      ? "bg-white text-red-700"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  Accueil
                </Link>
                <Link
                  href="/dashboard/utilisateurs/Clients"
                  className={`font-bold rounded-lg lg:px-3 px-2 py-2 transition-all ${
                    pathname === "/dashboard/utilisateurs/Clients" || pathname==="/dashboard/utilisateurs/Clients/profile"
                      ? "bg-white text-red-700"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  Clients
                </Link>
                <Link
                  href="/dashboard/utilisateurs/gp"
                  className={`font-bold rounded-lg lg:px-3 px-2 py-2 transition-all ${
                    pathname === "/dashboard/utilisateurs/gp" || pathname==="/dashboard/utilisateurs/gp/profile"
                      ? "bg-white text-red-700"
                      : "text-white hover:bg-white hover:text-red-700"
                  }`}
                >
                  GP
                </Link>
              </div>
            )}
          </div>) :
         (<div></div>)}

        
        {role?.access_groups.annonces?(<Link
            href="/dashboard/annonces"
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/dashboard/annonces" ||  pathname === "/dashboard/annonces/profile"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Book className="h-8 w-4" />
            Annonces
          </Link>):((<div></div>))}
          
          {role?.access_groups.commandes?(<Link
            href="/dashboard/commandes"
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/dashboard/commandes" || pathname === "/dashboard/commandes/profile"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <ShoppingCart className="h-8 w-4" />
            Commandes
          </Link>):((<div></div>))}

          
          {role?.access_groups.finance?(<Link
            href="/dashboard/finance"
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/dashboard/finance"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <LineChart className="h-8 w-4" />
            Finances
          </Link>):((<div></div>))}

          

          {role?.access_groups.commentaires?(<Link
            href="/dashboard/commentaires"
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/dashboard/commentaires"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Text className="h-8 w-4" />
            Commentaires
          </Link>):((<div></div>))}
          
        </nav>
      </div>

      <div className="relative top-24">
        <nav className="grid gap-1 items-start px-1 text-sm font-medium lg:px-6">
          <div className="px-1 font-bold text-gray-100 pb-3">OTHERS</div>

         
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/dashboard/profile"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <User className="h-8 w-4" />
            Profile
          </Link>

          {role?.access_groups.accounts?( <Link
            href="/dashboard/accounts"
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/dashboard/accounts" || pathname === "/dashboard/accounts/profile"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Users  className="h-8 w-4" />
            Comptes
          </Link>):((<div></div>))}
         

          {role?.access_groups.settings  ?( <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/dashboard/settings"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <Settings className="h-8 w-4" />
            Paramètres
          </Link>):((<div></div>))}
          


          <button
            onClick={() => setDialogOpen(true)}
            className={`flex items-center gap-3 rounded-lg lg:px-3 px-2 py-2 font-bold transition-all ${
              pathname === "/"
                ? "bg-white text-red-700 shadow-lg"
                : "text-white hover:bg-white hover:text-red-700"
            }`}
          >
            <LogOut  className="h-8 w-4" />
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
    </div>):((<div></div>)) 

   
  );
}

export default Sidebar;
