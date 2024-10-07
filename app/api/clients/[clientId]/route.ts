import { clientSchema } from "@/app/dashboard/utilisateurs/Clients/data/schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

export async function GET(request: Request, context:any) {
    try {
        const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
        const users = JSON.parse(data.toString());
        const validatedUsers = z.array(clientSchema).parse(users);

        const {params}=context;
        const client = validatedUsers.filter(x=>(params.clientId === x.id_client))

        return NextResponse.json(client);
      } catch (error: any) {
        console.error("Validation Error:", error.errors);
        return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
      }  
}