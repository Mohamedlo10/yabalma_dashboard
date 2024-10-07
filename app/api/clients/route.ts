// app/api/users/route.ts
import { clientSchema } from "@/app/dashboard/utilisateurs/Clients/data/schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  const search = url.searchParams.get('search')?.toLowerCase() || '';

  try {
    const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
    const users = JSON.parse(data.toString());
    const validatedUsers = z.array(clientSchema).parse(users);
    

    const filteredUsers = validatedUsers.filter(user => user.is_gp === false);


    const searchedUsers = filteredUsers.filter(user =>
      user.nom.toLowerCase().includes(search) ||  
      user.prenom?.toLowerCase().includes(search) || 
      user.Tel?.toString().includes(search) ||       
      user.id_client?.toLowerCase().includes(search) 
    );

    // Tri des utilisateurs
    const usersSort = [...searchedUsers].sort((a, b) => (b.commande ?? 0) - (a.commande ?? 0));

    // Pagination
    const paginatedUsers = usersSort.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      users: paginatedUsers,
      total: usersSort.length, // Total des utilisateurs pour la pagination
    });
  } catch (error: any) {
    console.error("Validation Error:", error.errors);
    return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
  }
}



  export async function POST(request: Request) {
    try {
      const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
      const users = JSON.parse(data.toString());
      const validatedUsers = z.array(clientSchema).parse(users);
  
      // Get the highest ID and increment it by 1
      const newId = validatedUsers.length > 0 ? Math.max(...validatedUsers.map(user => user.id)) + 1 : 1;
  
      // Generate a unique client ID, for example "C001"
      const idClient = uuidv4().substring(0, 5);
      const tokentest=uuidv4();
  
      // Get the new client data from the request
      const json = await request.json();
      const newUser = clientSchema.parse({
        ...json,
        id: newId,
        created_at: new Date().toISOString(),
        id_client: idClient,
        fcm_token: tokentest,
        is_gp: false,
        commande: 0,
      });
  
      // Add the new client to the list
      validatedUsers.push(newUser);
  
      // Write the updated list back to the file
      await fs.writeFile(path.join(process.cwd(), "data/users.json"), JSON.stringify(validatedUsers, null, 2));
  
      return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
      console.error("Validation Error:", error.errors);
      return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
    }
}

