"use client";
import { Button } from "@/components/ui/button";
import { getSupabaseUser } from "@/lib/authMnager";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useRef, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { User } from "../accounts/schema";
import PersonalInfo from "./personalInfo";

const override: CSSProperties = {
	display: "block",
	margin: "0 auto",
	borderColor: "red",
};

const RecupInfo = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [user, setUser] = useState<User>();
	const [isLoading, setIsLoading] = useState(true);
	let [color, setColor] = useState("#ffffff");
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [uploadedImage, setUploadedImage] = useState<string | null>(null);
	const [userImage, setuserImage] = useState<string>("/avatars/01.png");
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [imageLoaded, setImageLoaded] = useState(false);

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

	const handleButtonClick = () => {
		if (fileInputRef.current) fileInputRef.current.click(); // Déclenche le clic sur l'input file
	};

	const handleFileChange = (event: any) => {
		const file = event.target.files[0];
		if (file) {
			console.log("Fichier sélectionné :", file);
			// Ajouter ici le code pour uploader l'image
		}
	};

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			try {
				const data = getSupabaseUser();
				setUser(data);
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
				<div className="flex flex-col w-full max-w-screen-xl mx-auto px-6 sm:px-8">
					<div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-4">
						{/* Avatar and name */}
						<div className="flex flex-auto items-center min-w-32 gap-12">
							<div className="relative w-28 h-28  rounded-full border-4 bg-slate-100 flex items-center justify-center">
								{!imageLoaded &&
									(user?.email ? (
										<span className="text-2xl font-bold text-red-700">
											{user?.email[0]}
											{user?.email[1]}
										</span>
									) : user?.phone ? (
										<span className="text-2xl font-bold text-red-700">
											{user?.phone[0]}
											{user?.phone[3]}
										</span>
									) : (
										<span className="text-8xl font-bold text-red-700"></span>
									))}
							</div>
							<div className="flex flex-col sm:max-w-full max-w-44 ml-4">
								{/* <div className="text-lg md:text-5xl font-semibold sm:w-full w-36 tracking-tight leading-7 md:leading-snug truncate">
                {user?.prenom} {user?.nom}
                </div> */}
								<div className="flex justify-center flex-col gap-2 items-center">
									<div className="leading-7 truncate text-xl font-bold text-red-700">
										{user?.email}
									</div>
									<div className="flex items-center justify-center">
										<div className="text-lg md:text-2xl font-semibold sm:w-full w-36 tracking-tight leading-7 md:leading-snug truncate">
											Utilisateur connecte
										</div>
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
					<div className="tabs flex flex-row gap-28 p-2 py-8 items-center justify-center">
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
						{activeTab === 1 && <div>Annonce</div>}
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecupInfo;
