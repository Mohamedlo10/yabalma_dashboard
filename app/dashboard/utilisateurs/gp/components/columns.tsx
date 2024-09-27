import { ColumnDef } from "@tanstack/react-table";
import { User } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<User>[] = [
  {
    id: "index",
    header: "TOP",
    cell: ({ row }) => <div className="font-bold bg-red-600 items-center flex justify-center rounded-full text-white">{row.index + 1}</div>, // Affiche l'indice + 1 pour commencer à 1
  },
  {
    accessorKey: "id_client",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px] font-bold">{row.getValue("id_client") as string}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "prenom",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prénom" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
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
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date d'inscription" />
    ),
    cell: ({ row }) => (
      <span>{new Date(row.getValue("created_at") as string).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "delivery",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre de livraison" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("delivery") as bigint}</span>
    ),
    enableSorting: true, // Activer le tri pour cette colonne
    // defaultCanSort: true, // Activer le tri par défaut
  },
  {
    accessorKey: "is_gp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GP" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("is_gp") ? "Oui" : "Non"}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
