import { z } from "zod";

export const clientSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  id_client: z.string(),
  prenom: z.string(),
  nom: z.string(),
  Tel: z.string(),
  Pays: z.string().nullable(),
  is_gp: z.boolean().nullable(),
  fcm_token: z.string().nullable(),
  ville: z.string().nullable(),
  img_url: z.string().nullable(),
});

export type User = z.infer<typeof clientSchema>;
