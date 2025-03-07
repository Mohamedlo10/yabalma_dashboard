import { ColumnDef } from "@tanstack/react-table";
import { User } from "../schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<User>[] = [
  {
    id: "index",
    header: "N*",
    cell: ({ row }) => <div className="font-bold bg-red-600 items-center flex justify-center rounded-full text-white">{row.index + 1}</div>, // Affiche l'indice + 1 pour commencer à 1
  },
  {
    id: "prenom",
    accessorKey: "user_metadata",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prenom" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[100px] truncate font-medium">
        {row.original.user_metadata?.prenom}
      </span>
    ),
  },
  {
    id: "nom",
    accessorKey: "user_metadata",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[100px] truncate font-medium">
        {row.original.user_metadata?.nom}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
        {row.getValue("email") as string}
      </span>
    ),
  },
 /*  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Téléphone" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[50px] truncate font-medium">
        {row.getValue("phone") as string}
      </span>
    ),
  }, */
  {
    id: "poste",
    accessorKey: "user_metadata",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
        {row.original.user_metadata?.poste?.nom}
      </span>
    ),
  },
  {
    accessorKey: "last_sign_in_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Derniere connexion" />
    ),
    cell: ({ row }) => (
      <span>{new Date(row.getValue("last_sign_in_at") as string).toLocaleString()}</span>
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
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
