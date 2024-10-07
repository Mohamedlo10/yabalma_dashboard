import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  total: number; // Nombre total d'éléments
  currentPage: number; // Page actuelle
  onPageChange: (page: number) => void; // Fonction pour gérer le changement de page
}

export function DataTablePagination<TData>({
  table,
  total,
  currentPage,
  onPageChange,
}: DataTablePaginationProps<TData>) {
  const totalPages = Math.ceil(total / table.getState().pagination.pageSize);

  return (
    <div className="flex items-center justify-between px-2">
      {/* Affichez le total d'éléments */}
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of {total} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Bouton pour aller à la page précédente */}
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </Button>
        
        {/* Affichage de la page actuelle et du nombre total de pages */}
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        
        {/* Bouton pour aller à la page suivante */}
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
