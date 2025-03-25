"use client";
import { getUsersCount } from "@/app/api/users/query";
import ClientPays from "@/components/ui/utilisateurs/clientPays";
import GpPays from "@/components/ui/utilisateurs/gpPays";
import UserClient from "@/components/ui/utilisateurs/userClient";
import UserGp from "@/components/ui/utilisateurs/userGp";
import { getSupabaseSession } from "@/lib/authMnager";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Admin } from "../profile/schema";

const override: CSSProperties = {
	display: "block",
	margin: "0 auto",
	borderColor: "red",
};

function Page() {
	const [isLoading, setIsLoading] = useState(true);
	let [color, setColor] = useState("#ffffff");
	const [totalUsers, setTotalUsers] = useState(0);
	const [totalActifs, setTotalActifs] = useState(0);
	const [user, setUser] = useState<Admin>();
	const [totalnonActifs, setTotalnonActifs] = useState(0);
	const [error, setError] = useState(null);
	const router = useRouter();

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			try {
				const data: any = await getUsersCount();

				if (data > 0) {
					setTotalUsers(data);
					setTotalActifs(data);
					setTotalnonActifs(0);
				}

				const data3 = getSupabaseSession();
				if (data3 != null) {
					if (data3.access_groups?.utilisateurs) {
						console.log("autoriser...");
					} else {
						router.push(`/dashboard`);
					}
				}
			} catch (error) {
				console.error("Error fetching room details:", error);
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
		<div className="flex flex-col h-[88vh] px-4 overflow-y-auto w-full">
			<div className="max-h-64 min-h-28 w-full flex justify-center md:gap-12 lg:gap-56 xl:gap-96 gap-auto items-center content-center p-1">
				<div className="flex flex-col justify-center items-center content-center">
					<p className="text-5xl text-red-600 font-bold">{totalUsers}</p>
					<p className="text-black font-bold">Utilisateurs</p>
				</div>
			</div>

			<div className="grid grid-cols-1  w-full">
				<div className="grid-cols-2 gap-2 w-full">
					<div className="flex flex-row gap-3 p-2 w-full items-center justify-center">
						<UserGp />
						<UserClient />
					</div>
					<div className="grid grid-cols-2 w-full gap-2">
						<GpPays />
						<ClientPays />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Page;
