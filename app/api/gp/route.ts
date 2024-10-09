// app/api/users/route.ts
import { clientSchema } from "@/app/dashboard/utilisateurs/schema";
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  const search = url.searchParams.get('search')?.toLowerCase() || '';

  try {
    const { data, error } = await supabase.from('client').select('*');

    if (error) {
      throw error;
    }

    const validatedUsers = z.array(clientSchema).parse(data);
    

    const filteredUsers = validatedUsers.filter(user => user.is_gp === true);


    const searchedUsers = filteredUsers.filter(user =>
      user.nom.toLowerCase().includes(search) ||  
      user.prenom?.toLowerCase().includes(search) || 
      user.Tel?.toString().includes(search) ||       
      user.id_client?.toLowerCase().includes(search) 
    );

    // Tri des utilisateurs
    // const usersSort = [...searchedUsers].sort((a, b) => (b.commande ?? 0) - (a.commande ?? 0));

    // Pagination
    const paginatedUsers = searchedUsers.slice((page - 1) * pageSize, page * pageSize);
    return NextResponse.json({
      users: paginatedUsers,
      total: searchedUsers.length, // Total des utilisateurs pour la pagination
    });
  } catch (error: any) {
    console.error("Validation Error:", error.errors);
    return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
  }
}



export async function POST(request: Request) {
  try {
    // Récupérer tous les clients existants
    const { data: clients, error: fetchError } = await supabase.from('client').select('*');

    if (fetchError) {
      throw new Error(`Error fetching clients: ${fetchError.message}`);
    }

    // Valider les clients existants avec Zod
    const validatedUsers = z.array(clientSchema).parse(clients);

    // Générer le nouvel ID
    const newId = validatedUsers.length > 0 ? Math.max(...validatedUsers.map(user => user.id ?? 0)) + 1 : 1;

    // Générer un identifiant client unique
    const idClient = uuidv4();

    // Récupérer les nouvelles données du client depuis la requête
    const json = await request.json();
    const newUser = clientSchema.parse({
      ...json,
      id: newId,
      created_at: new Date().toISOString(),
      id_client: idClient,
      fcm_token: null,
      is_gp: true, // Valeur par défaut
    });

    // Insérer le nouveau client dans Supabase
    const { data: insertedData, error: insertError } = await supabase
      .from('client')
      .insert([newUser]);

    if (insertError) {
      throw new Error(`Error inserting client: ${insertError.message}`);
    }

    // Renvoie le nouveau client en JSON avec un statut 201
    return NextResponse.json(insertedData, { status: 201 });

  } catch (error: any) {
    console.error("Error:", error.message || error);
    return NextResponse.json({ error: "Invalid user data or Supabase error" }, { status: 500 });
  }
}
