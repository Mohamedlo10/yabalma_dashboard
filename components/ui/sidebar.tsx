import { Badge } from "@/components/ui/badge";
import Link from "next/link";


import {
  Book,
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


function Sidebar() {
  return (
    <div>
      <div className="flex h-20 items-center border-b px-4 lg:h-22 lg:px-6">
            <Link href="/" className="flex items-center gap-4 px-2 font-semibold">
              <Package2 className="h-8 w-8" />
              <span className="text-white font-bold">YABALMA</span>
            </Link>
{/*             <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-8 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button> */}
          </div>
          <div className="relative top-12">
            <nav className="grid gap-1 items-start text-sm font-medium lg:px-6">
              <div className="px-1 font-bold text-gray-100 pb-4">
                MENU
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-3  bg-white text-red-700 shadow-lg  rounded-lg px-3 py-2 font-bold transition-all hover:bg-white hover:text-red-700"
              >
                <Home className="h-8 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/utilisateurs"
                className="flex items-center gap-3   rounded-lg px-3 py-2 text-white font-bold transition-all hover:bg-white hover:text-red-700"
              >
                <Users className="h-8 w-4" />
                Utilisateurs
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3   rounded-lg px-3 py-2 text-white font-bold transition-all hover:bg-white hover:text-red-700"
              >
                <ShoppingCart className="h-8 w-4" />
                Commandes
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  6
                </Badge>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3   rounded-lg font-bold  border-black px-3 py-2 transition-all hover:bg-white hover:text-red-700"
              >
                <LineChart className="h-8 w-4" />
                Finances{" "}
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3   rounded-lg px-3 py-2 text-white font-bold transition-all hover:bg-white hover:text-red-700"
              >
                <Book className="h-8 w-4" />
                Annonces
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3   rounded-lg px-3 py-2 text-white font-bold transition-all hover:bg-white hover:text-red-700"
              >
                <Text className="h-8 w-4" />
                Feedback
              </Link>
            </nav>
            </div>

          <div className="relative top-24">
          <nav className="grid gap-1 items-start px-1 text-sm font-medium lg:px-6">
              <div className="px-1 font-bold text-gray-100 pb-4">
                OTHERS
              </div>

                <Link
                href="#"
                className="flex items-center gap-3   rounded-lg px-3 py-2 text-white font-bold transition-all hover:bg-white hover:text-red-700"
              >
                <Settings className="h-8 w-4" />
                Settings
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3   rounded-lg px-3 py-2 text-white font-bold transition-all hover:bg-white hover:text-red-700"
              >
                <User className="h-8 w-4" />
                Account
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3   rounded-lg px-3 py-2 text-white font-bold transition-all hover:bg-white hover:text-red-700"
              >
                <Hand className="h-8 w-4" />
                Help
              </Link>
          </nav>
              
          </div>
    </div>
  )
}

export default Sidebar