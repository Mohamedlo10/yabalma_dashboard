import { z } from "zod";
import { annonceSchema } from "../trajets/schema";
import { clientSchema } from "../utilisateurs/schema";

const articleSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  currency: z.string().optional(),

  quantity: z.number(),
  totalPrice: z.number(),
});

export const detailsCommandeSchema = z.object({
  type: z.string(),
  articles: z.array(articleSchema).default([]),
  poids: z.string().optional(),
  payeur: z.string().optional(),
  expediteur: z.string().optional(),
  first_name: z.string().optional(),
  destinataire_number: z.string().optional(),
  destination: z.string().optional(),
});
export const shoppingSchema = z.object({
  id: z.number(),
  created_at: z.string().datetime(),
  status: z.string().default("processing"),
  price: z.number().nullable(),
  data: z.record(z.any()).nullable(),
  annonce_id: z.string().nullable(),
  url: z.string(),
  website: z.string(),
  user_id: z.string().uuid().nullable(),
});

z;
export const commandeSchema = z.object({
  id: z.number(),
  id_annonce: z.string(),
  id_client: z.string().nullable(),
  id_gp: z.string(),
  is_given_to_gp: z.boolean(),
  is_received_by_gp: z.boolean(),
  statut: z.string(),
  id_shop: z.string().optional().nullable(),
  shop: shoppingSchema.optional().nullable(),
  payment_status: z.string(),
  validation_status: z.boolean(),
  created_at: z.string().refine((date) => !isNaN(Date.parse(date))), // vérifie que c'est une date valide
  cancelled_status: z.boolean(),
  annonce: annonceSchema,
  total_price: z.string().optional().nullable(),
  client: clientSchema.nullable(),
  detail_commande: detailsCommandeSchema.optional(),
});

export type Commande = z.infer<typeof commandeSchema>;
export type DetailsCommande = z.infer<typeof detailsCommandeSchema>;
export type Article = z.infer<typeof articleSchema>;
