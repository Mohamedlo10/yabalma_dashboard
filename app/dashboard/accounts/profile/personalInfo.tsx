"use client";
import { getAllRole } from "@/app/api/settings/query";
import { DeleteCompteById, modifierCompte } from "@/app/api/superAdmin/query";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/dialogConfirm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Save, Trash2, UserRound, UserRoundPen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Admin } from "../../profile/schema";
import { Role } from "../../settings/schema";

type PersonalInfoProps = {
	user: Admin | null | undefined;
};
const override: CSSProperties = {
	display: "block",
	margin: "0 auto",
	borderColor: "red",
};
const PersonalInfo: React.FC<PersonalInfoProps> = ({ user }) => {
	const [editMode, seteditMode] = useState(false);
	const activeEdit = () => {
		seteditMode(!editMode);
	};
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	let [color, setColor] = useState("#ffffff");

	const [isDialogOpen, setDialogOpen] = useState(false);
	const [client, setClient] = useState({
		...user,
		phone: user?.phone || "",
		email: user?.email || "",
		poste: user?.user_metadata?.poste?.nom || "",
		prenom: user?.user_metadata?.prenom || "",
		nom: user?.user_metadata?.nom || "",
	});
	const [roles, setRoles] = useState<Role[]>([]);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setClient({ ...client, [name]: value });
	};

	const handleRoleChange = (selectedRole: string) => {
		setClient((prevClient) => ({
			...prevClient,
			poste: selectedRole, // Met à jour avec le rôle sélectionné
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const myposte = roles.find((role) => role.nom === client.poste);
		console.log(client);
		try {
			const response = await modifierCompte(
				client.id,
				client.email,
				myposte,
				client.nom,
				client.prenom
			);

			seteditMode(false);
		} catch (error) {
			console.error("Erreur lors de la modification du client:", error);
		}
		console.log("Reussi");
	};

	const deleteUser = async () => {
		try {
			const response = await DeleteCompteById(client.id);
			console.log("Suppression reussi");
			router.back();
		} catch (error) {
			console.error("Erreur lors de la Suppression du client:", error);
		}
	};
	async function fetchData() {
		setIsLoading(true);
		try {
			const data: any = await getAllRole();
			if (data && data.length > 0) {
				console.log(data);
				setRoles(data);
			}
		} catch (error) {
			console.error("Error fetching room details:", error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
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
		<div>
			<div className="p-3   max-h-[55vh] rounded-md w-full items-center justify-start flex flex-col gap-1">
				<div className="flex flex-col ">
					<div>
						<div className="flex items-center my-4">
							<UserRound />
							<div className="ml-2 text-black text-sm sm:text-xl font-bold">
								Informations personnelles
							</div>
						</div>

						{editMode && user ? (
							<form
								className="flex  flex-col w-full mb-6 h-full"
								onSubmit={handleSubmit}>
								<div className="grid grid-cols-2 gap-36 rounded-lg">
									{/* <!-- First Bloc --> */}
									<div className="p-2 mb-3">
										<div className="mb-4">
											<label className="block text-sm font-medium mb-2">
												Prenom
											</label>
											<input
												type="text"
												name="prenom"
												value={client.prenom}
												onChange={handleInputChange}
												placeholder="Prenom"
												className="border p-2 rounded w-full"
												required
											/>
										</div>

										{/*  <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={client.password}
                    onChange={handleInputChange}
                    placeholder="Mot de passe"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div> */}
										<div className="max-h-[21vh] overflow-y-auto">
											<div className="space-y-2">
												<h3 className="font-bold">Role</h3>
												{roles.map((role, index) => (
													<div
														key={index}
														className="flex items-center space-x-2">
														<input
															type="radio"
															id={`radio-${role}`}
															name="user-poste"
															value={role.nom}
															checked={client.poste === role.nom}
															onChange={(e) => handleRoleChange(e.target.value)}
															className="radio-input"
														/>
														<label
															htmlFor={`radio-${role}`}
															className="text-sm font-medium">
															{role.nom}
														</label>
													</div>
												))}
											</div>
										</div>
									</div>
									<div>
										<div className="mb-4">
											<label className="block text-sm font-medium mb-2">
												Nom
											</label>
											<input
												type="text"
												name="nom"
												value={client.nom}
												onChange={handleInputChange}
												placeholder="Nom"
												className="border p-2 rounded w-full"
												required
											/>
										</div>
										<div className="mb-4">
											<label className="block text-sm font-medium mb-2">
												Mail
											</label>
											<input
												type="text"
												name="email"
												value={client.email}
												onChange={handleInputChange}
												placeholder="Email"
												className="border p-2 rounded w-full"
												required
											/>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-12 ">
									<Button
										onClick={activeEdit}
										className="font-bold bg-white hover:text-slate-900 hover:bg-slate-100 text-slate-600  gap-2">
										<X />
										Annuler
									</Button>
									<Button type="submit" className="font-bold gap-2 ">
										<Save />
										Enregistrer
									</Button>
								</div>
							</form>
						) : (
							<div className="mb-5">
								<div className="grid grid-cols-2 gap-36 h-64 rounded-lg">
									{/* <!-- First Bloc --> */}
									<div className="p-4">
										<div className="mb-4">
											<div className="text-gray-500 text-sm sm:text-base">
												Prenom
											</div>
											<div className="leading-6 mt-1 text-sm sm:text-base font-bold">
												{client?.prenom}
											</div>
										</div>
										<div className="mb-4">
											<div className="text-gray-500 text-sm sm:text-base">
												Role
											</div>
											<div className="leading-6 mt-1 text-sm sm:text-base font-bold">
												{client?.poste}
											</div>
										</div>
										{client.email ? (
											<div className="mb-4">
												<div className="text-gray-500 text-sm sm:text-base">
													Email
												</div>
												<div className="leading-6 mt-1 text-sm sm:text-base font-bold">
													{client?.email}
												</div>
											</div>
										) : (
											<div className="mb-4">
												<div className="text-gray-500 text-sm sm:text-base">
													phone
												</div>
												<div className="leading-6 mt-1 text-sm sm:text-base font-bold">
													{client?.phone}
												</div>
											</div>
										)}
									</div>
									{/* <!-- Second Bloc --> */}
									<div className="p-4">
										<div className="mb-4">
											<div className="text-gray-500 text-sm sm:text-base">
												Nom
											</div>
											<div className="leading-6 mt-1 text-sm sm:text-base font-bold">
												{client?.nom}
											</div>
										</div>
										{user?.last_sign_in_at ? (
											<div className="mb-4">
												<div className="text-gray-500 text-sm sm:text-base">
													Derniere connexion
												</div>
												{user ? (
													<div className="leading-6 mt-1 text-sm sm:text-base font-bold">
														{format(
															new Date(user?.last_sign_in_at),
															"dd MMMM yyyy",
															{ locale: fr }
														)}
														{` à ${format(
															new Date(user?.last_sign_in_at),
															"HH:mm"
														)}`}
													</div>
												) : (
													<div className="text-xl">
														Erreur lors du chargement des donnees
													</div>
												)}
											</div>
										) : (
											<div></div>
										)}

										{user?.created_at ? (
											<div className="mb-4">
												<div className="text-gray-500 text-sm sm:text-base">
													Date d'inscription
												</div>
												{user ? (
													<div className="leading-6 mt-1 text-sm sm:text-base font-bold">
														{format(
															new Date(user?.created_at),
															"dd MMMM yyyy",
															{ locale: fr }
														)}
														{` à ${format(
															new Date(user?.created_at),
															"HH:mm"
														)}`}
													</div>
												) : (
													<div className="text-xl">
														Erreur lors du chargement des donnees
													</div>
												)}
											</div>
										) : (
											<div></div>
										)}
									</div>
								</div>
								<div className="grid grid-cols-2 gap-12">
									<Button
										onClick={() => setDialogOpen(true)}
										className="font-bold gap-2 bg-red-700 hover:bg-red-800">
										<Trash2 />
										Supprimer
									</Button>
									<Button onClick={activeEdit} className="font-bold gap-2">
										<UserRoundPen />
										Modifier
									</Button>
									<ConfirmDialog
										isOpen={isDialogOpen}
										message={`Etes-vous sûr de vouloir supprimer ${client.email} ?`}
										onConfirm={() => {
											deleteUser();
											setDialogOpen(false);
										}}
										onCancel={() => setDialogOpen(false)}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PersonalInfo;
