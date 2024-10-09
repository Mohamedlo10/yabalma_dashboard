import { userSchema } from "@/app/dashboard/utilisateurs/gp/data/schema";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

export async function GET() {
  try {
    // Lecture et validation des données utilisateurs
    const data = await fs.readFile(path.join(process.cwd(), "data/users.json"));
    const users = JSON.parse(data.toString());
    const validatedUsers = z.array(userSchema).parse(users);
    const gps = validatedUsers.filter(gp => gp.is_gp === true);

    // Lecture du fichier des codes des pays
    const countryData = await fs.readFile(path.join(process.cwd(), "data/payscode.json"));
    
    // Accéder au premier élément du tableau pour obtenir l'objet des codes de pays
    const countryCodesArray = JSON.parse(countryData.toString());
    const countryCodes = countryCodesArray[0]; // Obtenez l'objet de pays

    // Comptage des utilisateurs par pays
    const gpsByCountry = gps.reduce((acc: Record<string, number>, user) => {
      acc[user.Pays] = (acc[user.Pays] || 0) + 1;
      return acc;
    }, {});

    // Transformation en tableau { pays, code, gp }
    const result = Object.keys(gpsByCountry).map((pays) => {
      const code = countryCodes[pays]; // Associe le pays avec son code
      return {
        pays,
        code: code || pays, // Gérer les pays sans code
        gp: gpsByCountry[pays]
      };
    });

    return NextResponse.json({
      total: gps.length,
      data: result
    });
  } catch (error: any) {
    console.error("Validation Error:", error.errors);
    return NextResponse.json({ error: "Invalid data" }, { status: 500 });
  }
}
