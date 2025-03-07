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
      <div className="w-[80px] font-bold">{row.getValue("id") as string}</div>
    ),
  },
  {
    id: "annonce_transport",
    accessorKey: "annonce",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transport" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
        {row.original.annonce.type_transport}
      </span>
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
      <DataTableColumnHeader column={column} title="Annonce" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
        {row.original.annonce.source} - {row.original.annonce.destination}
      </span>
    ),
  },
  {
    accessorKey: "statut",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => <span>{row.getValue("statut") as string}</span>,
  },
  {
    accessorKey: "detail_commande",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Destinataire" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
        {row.original.detail_commande?.first_name} 
      </span>
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

