import { Annonce } from "@/app/dashboard/annonces/schema";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Annonce>[] = [
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
        {row.original.type_transport}
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
        {row.original.client?.prenom} {row.original.client?.nom}
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
        {row.original.source} - {row.original.destination}
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

