import { z } from "zod";

export const clientSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  id_client: z.string(),
  prenom: z.string(),
  nom: z.string(),
  Tel: z.string(),
  Pays: z.string(),
  delivery: z.number().optional(), 
  commande: z.number().optional(), 
  is_gp: z.boolean(),
  fcm_token: z.string(),
  ville: z.string(),
  img_url: z.string(),
}).refine(data => {
  if (data.is_gp && data.delivery === undefined) {
    return false;
  }
  return true;
}, {
  message: "Delivery is required when is_gp is true.",
  path: ["delivery"], 
});

export type User = z.infer<typeof clientSchema>;
