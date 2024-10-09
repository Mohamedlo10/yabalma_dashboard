// app/api/annonces/route.ts
import { annonceSchema } from "@/app/dashboard/annonces/schema";
import { type User } from "@/app/dashboard/utilisateurs/gp/data/schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    // Lire les annonces
    const annoncesData = await fs.readFile(path.join(process.cwd(), "data/annonces.json"));
    const annonces = JSON.parse(annoncesData.toString());
    const validatedAnnonces = z.array(annonceSchema).parse(annonces);

    // Lire les GP (utilisateurs)
    const gpData = await fs.readFile(path.join(process.cwd(), "data/users.json"));
    const gps: User[] = JSON.parse(gpData.toString());

    // Créer un dictionnaire pour un accès rapide aux GP
    const gpMap: Record<string, User> = {};
    gps.forEach((gp) => {
      gpMap[gp.id_client] = gp;
    });

    // Ajouter les informations GP à chaque annonce
    const annoncesAvecGp = validatedAnnonces.map((annonce) => {
      const gp = gpMap[annonce.idGp] || null; // Si le GP n'existe pas, renvoyer null
      return { ...annonce, gp };
    });

    // Trier les annonces par date de création (ordre décroissant)
    const annoncesSort = annoncesAvecGp.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Paginer les résultats
    const start = (page - 1) * limit;
    const paginatedAnnonces = annoncesSort.slice(start, start + limit);

    // Agrégations (exemple : compter les annonces par GP)
    const annonceCountByGp = annoncesAvecGp.reduce((acc, annonce) => {
      const gpId = annonce.idGp;
      if (gpId) {
        acc[gpId] = (acc[gpId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Agrégations supplémentaires (si nécessaire)
    const totalAnnonces = validatedAnnonces.length;
    const totalGp = Object.keys(gpMap).length;

    // Réponse JSON avec les données paginées et agrégées
    return NextResponse.json({
      annonces: paginatedAnnonces,
      stats: {
        totalAnnonces,
        totalGp,
        annonceCountByGp,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces:", error);
    return NextResponse.json({ error: "Données invalides ou erreur serveur" }, { status: 500 });
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
