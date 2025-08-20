"use client"
import Image from "next/image";
import { CSSProperties, useState } from "react";
import { Role } from "@/app/dashboard/settings/schema";
import { useEffect } from "react";
import { getSupabaseSession } from "@/lib/authMnager";
import BeatLoader from "react-spinners/BeatLoader";
import { LogIn, User } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  toggleSidebar: () => void;
}

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function Navbar({ toggleSidebar }: NavbarProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<Role>();
    let [color, setColor] = useState("#ffffff");

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
            <span
              className={`transition-opacity duration-300`}
            >
                        Veuillez Vous Connectez
            </span>
          </Link>
            ) : (
              <div className="flex items-center gap-2 w-1/3 rounded-md px-2 py-1.5 font-medium text-base transition-all text-red-700 hover:bg-red-700 hover:text-white">
                <User className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`transition-opacity duration-300`}
                >
                  {role.nom}
                </span>
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
