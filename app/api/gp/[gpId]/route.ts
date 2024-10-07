import { userSchema } from "@/app/dashboard/utilisateurs/gp/data/schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

export async function GET(request: Request, context: any) {
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
    const users = JSON.parse(data.toString());
    const validatedUsers = z.array(userSchema).parse(users);

    const { params } = context;
    const gp = validatedUsers.find(x => params.gpId === x.id_client); // Utilise find au lieu de filter

    if (!gp) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(gp);
  } catch (error: any) {
    console.error("Validation Error:", error.errors);
    return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
  }  
}
