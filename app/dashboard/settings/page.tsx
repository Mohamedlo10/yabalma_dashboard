"use client";
import Image from "next/image";

import {
	creerRole,
	getAllRole,
	modifierRole,
	supprimerRole,
} from "@/app/api/settings/query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/ui/dialogConfirm";
import { paths } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseSession } from "@/lib/authMnager";
import Drawer from "@mui/material/Drawer";
import { Plus, Save, Settings, Trash2, UserRoundPen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Role } from "./schema";

const override: CSSProperties = {
	display: "block",
	margin: "0 auto",
	borderColor: "red",
};

export default function Page() {
	const [roles, setRoles] = useState<Role[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [SelectedRole, setSelectedRole] = useState<Role | null>(null);
	const [selectedRoleId, setSelectedRoleId] = useState<any>(null);
	const [selectedRoleNom, setSelectedRoleNom] = useState<any>(null);
	const [editMode, seteditMode] = useState(false);
	const [isAddingRole, setIsAddingRole] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDialogOpen, setDialogOpen] = useState(false);
	let [color, setColor] = useState("#ffffff");
	const [role, setRole] = useState<Role>({
		...SelectedRole,
		nom: SelectedRole?.nom || "",
		access_groups: SelectedRole?.access_groups || {},
	});
	const router = useRouter();

	async function fetchData() {
		setIsLoading(true);
		try {
			const data: any = await getAllRole();
			if (data && data.length > 0) {
				setRoles(data);
				console.log(data);
			}

			const data3 = getSupabaseSession();
			if (data3 != null) {
				if (data3.access_groups?.settings) {
					console.log("autoriser...");
				} else {
					router.push(`/dashboard`);
				}
			}
		} catch (error) {
			console.error("Error fetching Roles :", error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchData();
	}, []);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setRole({ ...role, [name]: value });
	};

	const activeEdit = () => {
		seteditMode(!editMode);
	};

	const deleteRole = async (id: any) => {
		try {
			const response = await supprimerRole(id);
			console.log("Suppression reussi");
			fetchData();
		} catch (error) {
			console.error("Erreur lors de la Suppression du client:", error);
		}
	};

	const handleCheckboxChange = (path: string, isChecked: boolean) => {
		setRole((prevRole) => ({
			...prevRole,
			access_groups: {
				...prevRole.access_groups,
				[path]: isChecked,
			},
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			console.log(role);
			const response = await creerRole(role);

			setRole({
				nom: "",
				access_groups: {},
			});
			setIsDrawerOpen(false);
			setSelectedRole(null);
			fetchData();
			setIsLoading(false);
			/*   toast.success(`Gp ajouté avec succès: ${newGp.prenom}`);
      console.log(`Gp ajouté avec succès: ${newGp.prenom}`);

    } else {
      console.error("Erreur lors de l'ajout du client");
      toast.error("Erreur lors de l'ajout du client");
    } */
		} catch (error) {
			console.error("Erreur lors de l'ajout du Gp:", error);
		}
	};

	const handleRoleClick = (user: any) => {
		setRole(user);
		setIsAddingRole(false);
		setIsDrawerOpen(true);
	};

	const handleAddRoleClick = () => {
		setRole({
			nom: "",
			access_groups: {},
		});
		setIsAddingRole(true);
		setIsDrawerOpen(true);
	};

	const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			console.log(role);
			const response = await modifierRole(role.id, role);

			setRole({
				nom: "",
				access_groups: {},
			});
			setIsDrawerOpen(false);
			setSelectedRole(null);
			fetchData();
			setIsLoading(false);
			/*   toast.success(`Gp ajouté avec succès: ${newGp.prenom}`);
      console.log(`Gp ajouté avec succès: ${newGp.prenom}`);

    } else {
      console.error("Erreur lors de l'ajout du client");
      toast.error("Erreur lors de l'ajout du client");
    } */
		} catch (error) {
			console.error("Erreur lors de l'ajout du Gp:", error);
		}
	};

	const closeDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedRole(null);
	};

	const handleDeleteClick = (role: any) => {
		setSelectedRoleId(role.id);
		setSelectedRoleNom(role.nom);
		setDialogOpen(true);
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
		<>
			<Drawer anchor="right" open={isDrawerOpen} onClose={closeDrawer}>
				<div className="p-4 flex items-center justify-center h-full w-[32vw]">
					{isAddingRole ? (
						<div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
							<h2 className="mb-8 text-2xl font-bold">
								Ajouter un Nouveau Role
							</h2>
							<form className="w-full" onSubmit={handleSubmit}>
								<div className="mb-4">
									<h3 className="block text-sm font-bold mb-2">Nom</h3>
									<input
										type="text"
										name="nom"
										value={role.nom}
										onChange={handleInputChange}
										placeholder="Nom"
										className="border p-2 rounded w-full"
										required
									/>
								</div>
								<div className="mb-4">
									<div className="space-y-2">
										<h3 className="font-bold">Access Groups</h3>
										{paths.map((path, index) => (
											<div key={index} className="flex items-center space-x-2">
												<Checkbox
													id={`checkbox-${path}`}
													checked={!!role.access_groups[path]}
													onCheckedChange={(isChecked) =>
														handleCheckboxChange(path, isChecked as boolean)
													}
												/>
												<label
													htmlFor={`checkbox-${path}`}
													className="text-sm font-medium">
													{path}
												</label>
											</div>
										))}
									</div>
								</div>

								<div className="ml-auto pt-8 w-full items-center justify-center flex font-medium">
									<Button type="submit" className="w-fit h-10 font-bold">
										Enregistrer
									</Button>
								</div>
							</form>
						</div>
					) : (
						<>
							<div className="flex w-full max-w-xl flex-col items-center border bg-white p-10 text-left">
								<h2 className="mb-8 text-2xl font-bold">Modifier le role</h2>
								<form onSubmit={handleSubmitEdit} className="w-full py-4">
									<div className="py-4">
										<h3 className="block text-sm font-bold mb-2">Nom</h3>
										<input
											type="text"
											name="nom"
											value={role?.nom}
											onChange={handleInputChange}
											placeholder="Nom"
											className="border p-2 rounded w-full"
											required
										/>
									</div>
									<div className="h-full">
										<div className="space-y-2">
											<h3 className="font-bold">Access Groups</h3>
											{paths.map((path, index) => (
												<div
													key={index}
													className="flex items-center space-x-2">
													<Checkbox
														id={`checkbox-${path}`}
														checked={!!role.access_groups[path]}
														onCheckedChange={(isChecked) =>
															handleCheckboxChange(path, isChecked as boolean)
														}
													/>
													<label
														htmlFor={`checkbox-${path}`}
														className="text-sm font-medium">
														{path}
													</label>
												</div>
											))}
										</div>
									</div>
									<div>
										<div className="ml-auto pt-8 w-full items-center justify-center flex font-medium">
											<Button type="submit" className="font-bold gap-2">
												<Save />
												Enregistrer
											</Button>
										</div>
									</div>
								</form>
								<Button
									onClick={closeDrawer}
									className="font-bold bg-white hover:text-slate-900 hover:bg-slate-100 text-slate-600">
									<X />
									Annuler
								</Button>
							</div>
						</>
					)}
				</div>
			</Drawer>
			<div className="md:hidden">
				<Image
					src="/examples/dashboard-light.png"
					width={1280}
					height={866}
					alt="Dashboard"
					className="block dark:hidden"
				/>
				<Image
					src="/examples/dashboard-dark.png"
					width={1280}
					height={866}
					alt="Dashboard"
					className="hidden dark:block"
				/>
			</div>
			<div className="hidden flex-col max-h-[90vh] overflow-y-auto  md:flex">
				<div className="border-b"></div>
				<div className="flex-1 md:space-y-4 space-y-4 p-8 pt-6">
					<div className="flex items-center justify-between  pb-2">
						<h2 className="text-4xl flex  items-center justify-center gap-2 font-bold tracking-tight">
							{" "}
							<Settings /> Paramètres
						</h2>
					</div>

					<Tabs defaultValue="overview" className="pb-4">
						<div className="flex items-center justify-between">
							<div className="">
								<TabsList>
									<TabsTrigger value="overview">Role</TabsTrigger>
									<TabsTrigger value="others">Autres parametres</TabsTrigger>
								</TabsList>
							</div>
							<div className="flex items-center space-x-2">
								<Button
									type="button"
									className="w-fit h-fit font-bold bg-red-600"
									onClick={handleAddRoleClick}>
									<Plus /> Ajouter un Role
								</Button>
							</div>
						</div>
						<TabsContent value="overview" className="space-y-8">
							<div className="grid gap-4 py-4 md:grid-cols-2 lg:grid-cols-4">
								{roles.map((role) => (
									<Card key={role.id} className="">
										<ConfirmDialog
											isOpen={isDialogOpen}
											message={`Etes-vous sûr de vouloir supprimer : ${selectedRoleNom} ?`}
											onConfirm={() => {
												if (selectedRoleId !== null) {
													deleteRole(selectedRoleId);
													setSelectedRoleId(null);
													setSelectedRoleNom(null);
												}
												setDialogOpen(false);
											}}
											onCancel={() => {
												setDialogOpen(false);
												setSelectedRoleId(null);
												setSelectedRoleNom(null);
											}}
										/>

										<CardContent className="h-80">
											<div className="py-4">
												<div className="py-4">
													<div className="font-bold text-base">{role.nom}</div>
												</div>
												{Object.entries(role.access_groups).map(
													([key, value]) => (
														<h3 key={key}>- {key}</h3>
													)
												)}
											</div>
										</CardContent>
										<CardFooter className="h-12 justify-between">
											<>
												<div className="w-full grid grid-cols-2 gap-4">
													<Button
														onClick={() => handleDeleteClick(role)}
														className="font-bold gap-1 text-sm bg-red-700 hover:bg-red-800">
														<Trash2 />
														Supprimer
													</Button>
													<Button
														onClick={() => handleRoleClick(role)}
														className="font-bold gap-2">
														<UserRoundPen />
														Modifier
													</Button>
												</div>
											</>
										</CardFooter>
									</Card>
								))}
							</div>
						</TabsContent>

						<TabsContent value="others" className="space-y-4">
							Autres parametres
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
