'use client'
import { useState, useEffect } from "react";
import { columns } from "@/components/proprio_table/column";
import { DataTable } from "@/components/proprio_table/data-table";
import { getalllogs } from "@/app/api/logapi/query";




interface Room {
  id: number;
  Room_type: string;
  Room_number: number;
  Room_status: string;
  Return_status: string;
  Room_classe: string;
  Reservation_Status: string;
  // Ajoutez les autres propriétés de room ici
}

export default function Log_table() {

    const [rooms, setRooms] = useState([]);
    

  return (
    <div className=" h-full px-3 ">
      <div className="flex-1 flex-col space-y-8 py-4 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex justify-between items-center w-full space-x-4">
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-bold tracking-normal">Logs!</h2>
              <p className="text-muted-foreground">
                Decouvrez l'ensemble des logs de yabalma
              </p>
            </div>
           
          </div>
        </div>
        <div className="bg-white mb-7 py-4 px-2 rounded-sm">
          <DataTable data={rooms} columns={columns} />
        </div>
      </div>
    </div>
  );
}
