import Navbar from "@/components/ui/navbar"
import Sidebar from "@/components/ui/sidebar"

export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
     <div className="w-full h-screen">
        <div className="grid grid-cols-12 w-full ">
            <div className="col-span-2 p-4 h-screen bg-red-500">
            <Sidebar />
            </div>
            <div className="col-span-10 px-4 py-4 flex flex-col space-y-2 bg-white"> 
            <Navbar />
            <div>
            <section>{children}</section>
            </div>
            </div>
        </div>
     </div>
    )
  }