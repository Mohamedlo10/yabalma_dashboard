import Image from "next/image";
interface NavbarProps {
  toggleSidebar: () => void;
}

function Navbar({ toggleSidebar }: NavbarProps) {
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
          <form>
            <div className="relative"></div>
          </form>
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
