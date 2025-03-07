import { ColumnDef } from "@tanstack/react-table";
import { User } from "../../schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<User>[] = [
  {
    id: "index",
    header: "TOP",
    cell: ({ row }) => <div className="font-bold bg-red-600 items-center flex justify-center rounded-full text-white">{row.index + 1}</div>, // Affiche l'indice + 1 pour commencer à 1
  },
  {
    accessorKey: "prenom",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prénom" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] px-2 truncate font-medium">
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
      <span className="max-w-[200px] truncate font-medium">
        {row.getValue("nom") as string}
      </span>
    ),
  },
  {
    accessorKey: "Tel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Téléphone" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("Tel") as string}</span>
    ),
  },
  {
    accessorKey: "Pays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pays" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("Pays") as string}</span>
    ),
  },
  {
    accessorKey: "ville",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ville" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("ville") as string}</span>
    ),
  },
  {
    accessorKey: "total_commandes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commande" />
    ),
    cell: ({ row }) => (
      <span className="px-5" >{row.getValue("total_commandes") as bigint}</span>
    ),
    enableSorting: true, // Activer le tri pour cette colonne
  }, 
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date d'inscription" />
    ),
    cell: ({ row }) => (
      <span>{new Date(row.getValue("created_at") as string).toLocaleString()}</span>
    ),
  },
  /* {
    accessorKey: "commande",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commande" />
    ),
    cell: ({ row }) => (
      <div className="ml-8">{row.getValue("commande") as bigint}</div>
    ),
    enableSorting: true, // Activer le tri pour cette colonne
    // defaultCanSort: true, // Activer le tri par défaut
  }, */
  /*  {
    accessorKey: "actif",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actif" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("actif") ?(<div className="bg-green-600 p-1 text-white w-12 items-center justify-center flex rounded-sm">Oui</div>) : (<div className="bg-red-600 p-1 text-white w-12 items-center justify-center flex rounded-sm">Non</div>)}</span>

    ),
  },  */
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
