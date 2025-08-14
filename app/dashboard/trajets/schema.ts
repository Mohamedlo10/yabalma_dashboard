import { z } from "zod";
import { clientSchema } from "../utilisateurs/schema";

export const annonceSchema = z.object({
  id: z.number().optional(),
  id_annonce: z.string().optional(),
  type_transport: z.enum(["economy", "express", "avion"], {
    required_error: "Le type de transport est requis",
  }),
  created_at: z.string().optional(),
  poids_max: z
    .number()
    .positive("Le poids maximum doit être positif")
    .nullable(),
  stock_annonce: z.number().positive("Le stock doit être positif").nullable(),
  id_client: z.string().default("d04cda0e-0fa8-4fbc-bc3d-50e446e4ac79"),
  client: clientSchema.optional(),

  statut: z.string().default("Entrepot"),
  is_boost: z.boolean().default(false),
  destination: z.string().min(1, "La destination est requise"),
  source: z.string().min(1, "La source est requise"),
  devise_prix: z.enum(["FCFA", "EUR", "USD"], {
    required_error: "La devise est requise",
  }),
  lieu_depot: z.string().nullable().optional(),
  sourceAddress: z.string().optional().nullable(),
  destinationAddress: z.string().optional().nullable(),
  date_depart: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format de date invalide pour la date de départ.",
  }),
  date_arrive: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format de date invalide pour la date d'arrivée.",
  }),
  shipping_started_at: z.string().nullable().optional(),
});

export type Annonce = z.infer<typeof annonceSchema>;
/* 
create table
  public.annonce (
    devise_prix text null default 'FCFA'::text,
    constraint annonce_pkey primary key (id),
    constraint annonce_id_annonce_key unique (id_annonce),
    constraint annonce_id_client_fkey foreign key (id_client) references client (id_client)
  ) tablespace pg_default; */
