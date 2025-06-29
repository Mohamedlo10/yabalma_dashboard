"use client";
import { getCompteById } from "@/app/api/superAdmin/query";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Admin } from "../../profile/schema";
import PersonalInfo from "./personalInfo";

const override: CSSProperties = {
	display: "block",
	margin: "0 auto",
	borderColor: "red",
};

const RecupInfo = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [user, setUser] = useState<Admin>();
	const [isLoading, setIsLoading] = useState(true);
	let [color, setColor] = useState("#ffffff");
	const router = useRouter();
	const searchParams = useSearchParams();
	const userId = searchParams.get("id");

	const handleRetour = () => {
		console.log("Retour");
		router.back();
	};

	const getInitials = (name: string, name2: string) => {
		const initial1 = name
			?.split(" ")
			.map((word: string) => word[0])
			.join("");
		const initial2 = name2
			?.split(" ")
			.map((word: string) => word[0])
			.join("");
		const initials = initial1 + initial2;
		return initials?.toUpperCase();
	};

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			try {
				const data: any = await getCompteById(userId);
				if (data != null) {
					console.log(data);
					setUser(data);
				}
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
		<div className="flex flex-col flex-auto min-w-0">
			{/* Header */}
			<div className="p-4">
				<button className="rounded-xl" onClick={handleRetour}>
					{/* Remplacer mat-icon par une icône équivalente */}
					<svg
						className="m-1 h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
				<div className="flex flex-col w-full max-w-screen-xl mx-auto px-6 sm:px-8">
					<div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-4">
						{/* Avatar and name */}
						<div className="flex flex-auto items-center min-w-32 gap-12">
							<div className="flex flex-col sm:max-w-full max-w-44 ml-4">
								<div className="text-base md:text-3xl font-semibold sm:w-full w-36 tracking-tight leading-7 md:leading-snug truncate">
									{user?.email}
								</div>
								<div className="flex justify-center flex-col gap-2 items-center">
									<div className="leading-7 truncate text-xl font-bold text-red-700">
										COMPTE
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main */}
			<div className="flex-auto border-t bg-white -mt-px">
				<div className="w-full max-w-screen-xl mx-auto">
					{/* Tabs */}
					<div className="tabs flex flex-row gap-8 p-2 py-2 items-center justify-center">
						<Button
							className={` hover:text-white hover:bg-red-700 hover:opacity-100 transition-shadow font-bold tab ${
								activeTab === 0
									? "active bg-red-700 text-white"
									: " opacity-70 bg-white text-red-800"
							}`}
							onClick={() => setActiveTab(0)}>
							Informations
						</Button>
					</div>

					{/* Tab content */}
					<div className="tab-content">
						{activeTab === 0 && (
							<div>
								<PersonalInfo user={user} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecupInfo;
