import { clientSchema } from "@/app/dashboard/utilisateurs/schema";
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
    try {
        const { data, error } = await supabase.from('client').select('*');

        if (error) {
          throw error;
        }
        const validatedUsers = z.array(clientSchema).parse(data);
        
        const clients = validatedUsers.filter(client => client.is_gp != true);

      // Trouver le client avec la date de création la plus récente
            const clientAvecCreationRecente = clients.reduce((prev, current) => {
                const prevCreatedAt = new Date(prev.created_at).getTime(); 
                const currentCreatedAt = new Date(current.created_at).getTime(); 
                
                return (prevCreatedAt > currentCreatedAt) ? prev : current;
            });

        return NextResponse.json(clientAvecCreationRecente);
    } catch (error: any) {
        console.error("Validation Error:", error.errors);
        return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
    }  
}
