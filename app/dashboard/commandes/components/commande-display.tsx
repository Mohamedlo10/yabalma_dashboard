import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { format } from "date-fns";
import { MoreVertical, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { type Commande } from "../schema";

interface CommandeDisplayProps {
	commande: Commande | null;
}

export function CommandeDisplay({ commande }: CommandeDisplayProps) {
	const today = new Date();
	const router = useRouter();
	const handleNavigation = (idCommande: number) => {
		router.push(`/dashboard/commandes/profile?id=${idCommande}`);
	};
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center py-2 px-2">
				<div className="flex items-center gap-2">
					<div className="flex flex-row text-sm  items-center justify-center gap-3">
						<div className="  text-muted-foreground">Commande de </div>
						<div className=" text-red-700 ">
							{commande?.client?.prenom} {commande?.client?.nom}
						</div>
					</div>
				</div>
				<div className="ml-auto flex items-center gap-2"></div>
				<Separator orientation="vertical" className="mx-2 h-6" />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" disabled={!commande}>
							<MoreVertical className="h-4 w-4" />
							<span className="sr-only">More</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>Mark as unread</DropdownMenuItem>
						<DropdownMenuItem>Star thread</DropdownMenuItem>
						<DropdownMenuItem>Add label</DropdownMenuItem>
						<DropdownMenuItem>Mute thread</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<Separator />
			{commande ? (
				<div className="flex flex-1 flex-col max-h-[84vh] overflow-y-auto items-center ">
					<div className="flex w-full max-w-xl flex-col items-center  bg-white p-2 text-left">
						<div className="flex flex-col gap-2 w-full ">
							<div className="flex flex-col w-full items-center gap-2 ">
								<div className="mb-2 text-sm  leading-none">Client</div>
								<Avatar className="hidden h-12 w-12  sm:flex">
									<AvatarImage
										src={`${commande.client?.img_url}`}
										className="rounded-full object-cover w-full h-full"
										alt="Avatar"
									/>
									<AvatarFallback className="text-xl  flex items-center justify-center">
										{" "}
										N/A
									</AvatarFallback>
								</Avatar>
								<div className="grid gap-1">
									<p className="text-sm  leading-none text-red-700">
										{commande.client?.prenom} {commande.client?.nom}
									</p>
								</div>

								<div className="line-clamp-2 flex flex-row gap-2  text-sm text-muted-foreground">
									<Phone /> {commande.client?.Tel}
								</div>
							</div>
							<div className="flex flex-col w-full items-center gap-2 ">
								<div className="mb-2 text-sm  leading-none">GP</div>
								<Avatar className="hidden h-12 w-12  sm:flex">
									<AvatarImage
										src={`${commande.annonce?.client?.img_url}`}
										className="rounded-full object-cover w-full h-full"
										alt="Avatar"
									/>
									<AvatarFallback className="text-xl  flex items-center justify-center">
										{commande.detail_commande?.type || "N/A"}
									</AvatarFallback>
								</Avatar>
								<div className="grid gap-1">
									<p className="text-sm  leading-none text-red-700">
										{commande.annonce?.client?.prenom}{" "}
										{commande.annonce?.client?.nom}
									</p>
								</div>

								<div className="line-clamp-2 flex flex-row gap-2  text-sm text-muted-foreground">
									<Phone /> {commande.annonce?.client?.Tel}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-2 mt-4">
							<div className="flex flex-col items-center  justify-center">
								{commande.annonce?.source}
								{/* <Flag code={commande.annonce?.source.code} className="h-8 w-10" />  */}
							</div>
							<div className="flex items-center justify-center pt-4">
								<FaArrowRight />
							</div>
							<div className="flex flex-col items-center  justify-center">
								{commande.annonce?.destination}

								{/* <Flag code={commande.annonce?.destination.code} className="h-8 w-10" />  */}
							</div>
						</div>
						{/* <div className="text-sm grid grid-cols-2  p-4 rounded-md shadow-sm w-full gap-full">
                  <div className="font-normal text-sm">ID</div>
                  <div className="text-sm">
                  {commande.id}
                  </div>
                </div> */}
						<div className=" px-2 lg:px-2 xl:px-2 w-full grid items-center gap-0 justify-center grid-cols-1">
							<div className="grid grid-cols-2 w-full col-span-2 gap-14 ">
								<div className="text-sm grid grid-cols-2 gap-auto items-center justify-center  w-full mt-4">
									<div className="line-clamp-2 flex flex-row gap-6 p-1  text-sm text-muted-foreground">
										Type:{" "}
									</div>
									<div className="text-sm text-black flex items-end w-full justify-end">
										{commande.detail_commande?.type}
									</div>
								</div>
								<div className="text-sm grid grid-cols-2 gap-auto items-center justify-center   w-full mt-4">
									<div className="line-clamp-2 flex flex-row gap-6 p-1  text-sm text-muted-foreground">
										Transport:{" "}
									</div>
									<div className=" flex items-end w-full justify-end">
										{commande.annonce?.type_transport}
									</div>
								</div>
							</div>

							{/* 	<div className="flex flex-row w-full col-span-2 gap-14 ">
								
							</div> */}

							<div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center   w-full mt-4">
								<div className="line-clamp-2 flex flex-row gap-12 p-1  text-sm text-muted-foreground">
									Date :{" "}
								</div>
								<div className="flex items-end w-full justify-end">
									{format(new Date(commande.created_at), "dd MMMM yyyy", {
										locale: fr,
									})}
								</div>
							</div>
							<div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center   w-full mt-4">
								<div className="line-clamp-2 flex flex-row gap-12 p-1  text-sm text-muted-foreground">
									Depart :{" "}
								</div>
								<div className="flex items-end w-full justify-end ">
									{format(
										new Date(commande.annonce.date_depart),
										"dd MMMM yyyy",
										{ locale: fr }
									)}
								</div>
							</div>
							<div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center   w-full mt-4">
								<div className="line-clamp-2 flex flex-row gap-12 p-1  text-sm text-muted-foreground">
									Date d'arriver le:{" "}
								</div>
								<div className="flex items-end w-full justify-start p-1">
									{format(
										new Date(commande.annonce.date_arrive),
										"dd MMMM yyyy",
										{ locale: fr }
									)}
								</div>
							</div>
							<div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center   w-full mt-4">
								<div className="line-clamp-2 flex flex-row gap-12 p-1  text-sm text-muted-foreground">
									Etat du colis:
								</div>
								<div className="flex items-end w-full justify-start p-1">
									{commande.annonce?.statut}
								</div>
							</div>
							<div className="text-sm grid grid-cols-2 col-span-2 gap-auto items-center justify-center   w-full mt-4">
								<div className="line-clamp-2 flex flex-row gap-12 p-1  text-sm text-muted-foreground">
									Etat de paiement:
								</div>
								<div
									className={`leading-6 text-sm  sm:text-sm px-2 w-fit  flex items-end  justify-start p-1  py-1 rounded-md text-white ${
										commande?.payment_status === "unpaid"
											? "bg-red-500"
											: "bg-green-500"
									}`}>
									{commande?.payment_status == "unpaid"
										? "Non regler"
										: "Regler"}
								</div>
							</div>

							<div className="flex flex-col w-full col-span-2 gap-4 ">
								<div className="text-sm grid grid-cols-2 gap-auto items-center justify-center   w-full mt-4">
									{commande.detail_commande?.first_name ? (
										<>
											{" "}
											<div className="line-clamp-2 flex flex-row  p-1  text-sm text-muted-foreground">
												Destinataire:{" "}
											</div>
											<div className="flex items-end w-full justify-start p-1">
												{commande.detail_commande?.first_name}
											</div>{" "}
										</>
									) : (
										<div></div>
									)}
									{commande.detail_commande?.destinataire_number ? (
										<>
											{" "}
											<div className="line-clamp-2 flex flex-row  mt-4 p-1  text-sm text-muted-foreground">
												Telephone Destinataire:{" "}
											</div>
											<div className="flex mt-4 items-end w-full justify-start p-1">
												{commande.detail_commande?.destinataire_number}
											</div>{" "}
										</>
									) : (
										<div></div>
									)}
								</div>
							</div>
							{/*  {commande.detail_commande?.location && (
                    <div className=" col-span-2 flex flex-row gap-auto items-center justify-center  text-lg gap-2 w-full mt-8">
                      <MapPin /> {commande.detail_commande?.location} {commande.detail_commande?.code_postal}
                    </div>
                    )} */}
						</div>
						<div className="ml-auto pt-4 xl:pt-12 w-full items-center justify-center flex font-medium">
							<Button
								onClick={() => handleNavigation(commande.id)}
								className="w-fit h-10 ">
								Voir Détails
							</Button>{" "}
						</div>
					</div>
				</div>
			) : (
				<div className="h-full w-full flex items-center justify-center p-8 text-center text-xl text-muted-foreground">
					Aucune commande selectionnee
				</div>
			)}
		</div>
	);
}
