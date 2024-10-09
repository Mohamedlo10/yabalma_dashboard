import { clientSchema } from "@/app/dashboard/utilisateurs/schema";
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request, context:any) {
    try {
      const { data, error } = await supabase.from('client').select('*');

      if (error) {
        throw error;
      }
        const validatedUsers = z.array(clientSchema).parse(data);

        const {params}=context;
        const client = validatedUsers.filter(x=>(params.clientId === x.id_client))

        return NextResponse.json(client);
      } catch (error: any) {
        console.error("Validation Error:", error.errors);
        return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
      }  
}