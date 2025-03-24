import Navbar from "@/components/ui/navbar";
import Sidebar from "@/components/ui/sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="w-full h-screen">
			<div className="grid grid-cols-12 h-full w-full ">
				<div className="col-span-2  h-full bg-red-700">
					<Sidebar />
				</div>
				<div className="col-span-10 h-full flex flex-col bg-white">
					<div className="h-[8vh]">
						<Navbar />
					</div>
					<div className="max-h-[90vh] overflow-y-auto">
						<section>{children}</section>
					</div>
				</div>
			</div>
		</div>
	);
}
