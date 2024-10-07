import { z } from "zod";
import { annonceSchema } from "../annonces/schema";
import { clientSchema } from "../utilisateurs/Clients/data/schema";



const destinataireSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  localisation: z.string().min(1),
  codePostal: z.string(),
  Tel: z.string().min(1),
});

// Schéma principal pour la commande
export const commandeSchema = z.object({
  id: z.string(),
  idAnnonce: z.string(),
  idClient: z.string(),
  client:clientSchema.optional(),
  annonce:annonceSchema.optional(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "canceled"]), 
  dateDeLivraison: z.string().optional(),
  limitLivraison: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for limitLivraison.",
  }),
  created_at: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for created_at.",
  }),
  charge: z.number().nonnegative(),
  destinataire: destinataireSchema, 
  read: z.boolean(),
});


export type Commande = z.infer<typeof commandeSchema>;
