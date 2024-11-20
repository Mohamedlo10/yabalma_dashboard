import { z } from "zod";
import { annonceSchema } from "../annonces/schema";
import { clientSchema } from "../utilisateurs/schema";


const detailCommandeSchema = z.object({
  code_postal: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  location: z.string().optional(),
  phone_number: z.string().optional(),
  poids: z.string().optional(),
});

// Schéma principal pour la commande
export const commandeSchema = z.object({
  id: z.number(),
  id_annonce: z.string(),
  id_client: z.string(),
  id_gp: z.string(),
  is_given_to_gp: z.boolean(),
  is_received_by_gp: z.boolean(),
  statut: z.string(),
  validation_status: z.boolean(),
  created_at: z.string().refine((date) => !isNaN(Date.parse(date))), // vérifie que c'est une date valide
  cancelled_status: z.boolean(),
  annonce: annonceSchema, 
  client: clientSchema,   
  detail_commande: detailCommandeSchema.optional(), 
});


export type Commande = z.infer<typeof commandeSchema>;
