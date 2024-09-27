// app/api/users/route.ts
import { userSchema } from "@/app/dashboard/utilisateurs/gp/data/schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

export async function GET() {
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
    const users = JSON.parse(data.toString());
    const validatedUsers = z.array(userSchema).parse(users);
    const filteredUsers = validatedUsers.filter(user => user.is_gp === true);
    const usersSort = [...filteredUsers].sort((a, b) => (b.delivery ?? 0) - (a.delivery ?? 0));
    return NextResponse.json(usersSort);
  } catch (error: any) {
    console.error("Validation Error:", error.errors);
    return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
  }
}
