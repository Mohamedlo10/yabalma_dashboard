import { User } from "@/app/dashboard/utilisateurs/schema";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<User>[] = [
	{
		id: "index",
		header: "TOP",
		cell: ({ row }) => (
			<div className="font-bold bg-red-600 items-center flex justify-center rounded-full text-white">
				{row.index + 1}
			</div>
		), // Affiche l'indice + 1 pour commencer à 1
	},
	/* {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px] font-bold">{row.getValue("id") as string}</div>,
    enableSorting: false,
    enableHiding: false,
  }, */
	{
		accessorKey: "prenom",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Prénom" />
		),
		cell: ({ row }) => (
			<span className=" text-sm max-w-[200px] px-2 truncate ">
				{row.getValue("prenom") as string}
			</span>
		),
	},
	{
		accessorKey: "nom",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nom" />
		),
		cell: ({ row }) => (
			<span className=" text-sm max-w-[150px] truncate ">
				{row.getValue("nom") as string}
			</span>
		),
	},
	{
		accessorKey: "Tel",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Téléphone" />
		),
		cell: ({ row }) => <span>{row.getValue("Tel") as string}</span>,
	},
	{
		accessorKey: "Pays",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Pays" />
		),
		cell: ({ row }) => <span>{row.getValue("Pays") as string}</span>,
	},
	/* {
		accessorKey: "ville",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Ville" />
		),
		cell: ({ row }) => (
			<span className=" text-sm max-w-[550px] truncate ">
				{row.getValue("ville") as string}
			</span>
		),
	}, */
	{
		accessorKey: "created_at",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Date d'inscription" />
		),
		cell: ({ row }) => (
			<span className=" text-sm max-w-[550px] truncate ">
				{new Date(row.getValue("created_at") as string).toLocaleString()}
			</span>
		),
	},
	{
		accessorKey: "total_annonces",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Annonce" />
		),
		cell: ({ row }) => (
			<span className=" text-sm px-5">
				{row.getValue("total_annonces") as bigint}
			</span>
		),
		enableSorting: true, // Activer le tri pour cette colonne
	},
	{
		accessorKey: "total_commandes",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Commande" />
		),
		cell: ({ row }) => (
			<span className=" text-sm px-5">
				{row.getValue("total_commandes") as bigint}
			</span>
		),
		enableSorting: true, // Activer le tri pour cette colonne
	},
	/*  {
    accessorKey: "is_gp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GP" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("is_gp") ? "Oui" : "Non"}</span>
    ),
  }, */ /* {
    accessorKey: "actif",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actif" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("actif") ?(<div className="bg-green-600 p-1 text-white w-12 items-center justify-center flex rounded-sm">Oui</div>) : (<div className="bg-red-600 p-1 text-white w-12 items-center justify-center flex rounded-sm">Non</div>)}</span>
    ),
  }, */
	{
		id: "actions",
		cell: ({ row }) => <DataTableRowActions row={row} />,
	},
];
