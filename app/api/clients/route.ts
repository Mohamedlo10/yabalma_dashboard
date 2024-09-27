// app/api/users/route.ts
import { clientSchema } from "@/app/dashboard/utilisateurs/Clients/data/schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

export async function GET() {
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
    const users = JSON.parse(data.toString());
    const validatedUsers = z.array(clientSchema).parse(users);
    const filteredUsers = validatedUsers.filter(user => user.is_gp === false);
    const usersSort = [...filteredUsers].sort((a, b) => (b.commande ?? 0) - (a.commande ?? 0));
    return NextResponse.json(usersSort);
  } catch (error: any) {
    console.error("Validation Error:", error.errors);
    return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
  }
}
