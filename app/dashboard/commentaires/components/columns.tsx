import { ColumnDef } from "@tanstack/react-table";
import { Commente } from "../schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
export const columns: ColumnDef<Commente>[] = [
/*   {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px] font-bold">{row.getValue("id") as string}</div>,
    enableSorting: false,
    enableHiding: false,
  }, */
  {
    accessorKey: "content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Content" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] min-w-[160px] ml-2 p-1 rounded-md font-bold  truncate">
        {row.getValue("content") as string}
      </span>
    )
  },
  {
    id: "auteur_commentaire",
    accessorKey: "client",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Auteur" />
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
      <span className="max-w-[4px] truncate font-medium">
        {row.original.annonce?.source} - {row.original.annonce?.destination} du {new Date(row.original.annonce?.date_depart as string).toLocaleDateString()}
      </span>
    ),
  },


  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de publication" />
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
