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
    const actifs = validatedUsers.filter(user => user.actif === true);
    const nonActifs = validatedUsers.filter(user => user.actif === false);
    return NextResponse.json({
      total: users.length,
      actifs:actifs.length,
      nonActifs:nonActifs.length
    });
  } catch (error: any) {
    console.error("Validation Error:", error.errors);
    return NextResponse.json({ error: "Invalid length " }, { status: 500 });
  }
}


