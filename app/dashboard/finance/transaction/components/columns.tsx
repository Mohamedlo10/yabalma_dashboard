import { Commande } from "@/app/dashboard/commandes/schema";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Commande>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[10px] font-bold">{row.getValue("id") as string}</div>
    ),
  },

  {
    id: "annonce_client",
    accessorKey: "annonce",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GP" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
        {row.original.annonce.client?.prenom} {row.original.annonce.client?.nom}
      </span>
    ),
  },
  {
    id: "annonce_details",
    accessorKey: "annonce", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commande" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[4px] truncate font-medium">
        {row.original.annonce.source} - {row.original.annonce.destination}
      </span>
    ),
  },
  {
    id: "encaissement",
    accessorKey: "detail_commande",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Encaissement" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[20px] truncate text-green-600 font-bold">
        {Number(row.original.detail_commande?.poids) *10050 || 15640 } 
      </span>
    ),
  },
  {
    id: "decaissement",
    accessorKey: "detail_commande",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Decaissement" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[20px] text-red-600 font-bold truncate ">
        {Number(row.original.detail_commande?.poids) *10050 - 1350 || 11255 } 
      </span>
    ),
  },
  {
    accessorKey: "Commission",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commission" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[10px] truncate text-green-700 font-bold">
       + {1350}
      </span>
    ),
  }, 
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date " />
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

