import { z } from "zod";
import { annonceSchema } from "../../trajets/schema";
import { clientSchema } from "../../utilisateurs/schema";



const detailCommandeSchema = z.object({
  code_postal: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  location: z.string(),
  phone_number: z.string(),
  poids: z.string(),
});

// Schéma principal pour la commande
export const commandeSchema = z.object({
  id: z.number(),
  id_annonce: z.string(),
  id_client: z.string().optional().nullable(),
  id_gp: z.string(),
  is_given_to_gp: z.boolean(),
  is_received_by_gp: z.boolean(),
  statut: z.string(),
  validation_status: z.boolean(),
  created_at: z.string().refine((date) => !isNaN(Date.parse(date))), // vérifie que c'est une date valide
  cancelled_status: z.boolean(),
  annonce: annonceSchema, 
  client: clientSchema.optional().nullable(),   
  detail_commande: detailCommandeSchema, 
});


export type Commande = z.infer<typeof commandeSchema>;
