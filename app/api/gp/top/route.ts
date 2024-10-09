import { clientSchema } from "@/app/dashboard/utilisateurs/schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

export async function GET() {
    try {
        const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
        const users = JSON.parse(data.toString());
        const validatedUsers = z.array(clientSchema).parse(users);
        
        const gps = validatedUsers.filter(gp => gp.is_gp === true);

        // Trouver le gp avec le plus grand nombre de deliverys
        const gpAvecPlusDedeliverys = gps.reduce((prev, current) => {
            const prevdeliverys = prev.delivery ?? 0; 
            const currentdeliverys = current.delivery ?? 0; 
            
            return (prevdeliverys > currentdeliverys) ? prev : current;
        });

        return NextResponse.json(gpAvecPlusDedeliverys);
    } catch (error: any) {
        console.error("Validation Error:", error.errors);
        return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
    }  
}
