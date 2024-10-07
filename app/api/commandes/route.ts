// app/api/users/route.ts
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
/* import { v4 as uuidv4 } from "uuid"; */
import { Annonce } from "@/app/dashboard/annonces/schema";
import { commandeSchema } from "@/app/dashboard/commandes/schema";
import { type User } from "@/app/dashboard/utilisateurs/gp/data/schema";
import { z } from "zod";


export async function GET() {
  try { // Lire les commandes
    const commandesData = await fs.readFile(path.join(process.cwd(), "data/commandes.json"));
    const commandes = JSON.parse(commandesData.toString());
    const validatedCommandes = z.array(commandeSchema).parse(commandes);

    // Lire les annonces
    const annonceData = await fs.readFile(path.join(process.cwd(), "data/annonces.json"));
    const annonces: Annonce[] = JSON.parse(annonceData.toString());

    // Créer un dictionnaire pour un accès rapide aux annonces
    const annonceMap: Record<string, Annonce> = {};
    annonces.forEach(annonce => {
      annonceMap[annonce.id] = annonce;
    });

    // Lire les GP
    const gpData = await fs.readFile(path.join(process.cwd(), "data/users.json"));
    const gps: User[] = JSON.parse(gpData.toString());

    // Créer un dictionnaire pour un accès rapide aux GP
    const gpMap: Record<string, User> = {};
    gps.forEach(gp => {
      gpMap[gp.id_client] = gp;
    });



    // Ajouter le GP à chaque annonce et ensuite à chaque commande
    const commandesAvecAnnonceEtGp = validatedCommandes.map(commande => {
      const annonce = annonceMap[commande.idAnnonce] || null; 
      const client = gpMap[commande.idClient] || null;
      const gp = annonce && annonce.idGp ? gpMap[annonce.idGp] : null; // Ajouter le GP à l'annonce

      return {
        ...commande,
        annonce: {
          ...annonce,
          gp,
        },
        client, 
      };
    });

    // Trier les commandes
    const commandesSort = commandesAvecAnnonceEtGp.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json(commandesSort);
  } catch (error) {
    console.error("Validation Error:", error);
    return NextResponse.json({ error: "Invalid user data" }, { status: 500 });
  }
}







/* 
  export async function POST(request: Request) {
    try {
      const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
      const users = JSON.parse(data.toString());
      const validatedUsers = z.array(annonceSchema).parse(users);
  
      // Get the highest ID and increment it by 1
      // const newId = validatedUsers.length > 0 ? Math.max(...validatedUsers.map(user => user.id)) + 1 : 1;
  
      // Generate a unique client ID, for example "C001"
      const idClient = uuidv4().substring(0, 5);
      const tokentest=uuidv4();
  
      // Get the new client data from the request
      const json = await request.json();
      const newUser = annonceSchema.parse({
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
 */
