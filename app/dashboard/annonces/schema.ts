import { z } from "zod";
import { clientSchema } from "../utilisateurs/schema";

export const annonceSchema = z.object({
  id: z.number(), 
  id_annonce:z.string(),
  type_transport:z.string(),
  created_at: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for created_at.",
  }),
  poids_max:z.number().nullable(),
  stock_annonce:z.number().nullable(),
  id_client: z.string(),
  client:clientSchema.optional(),
  tarif: z.number().positive().optional(),  
  statut:z.string(),
  is_boost:z.boolean(),
  destination: z.string(),
  source: z.string(),
  devise_prix: z.string(),
  lieu_depot: z.string(),
  date_depart: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for dateDepart.",
  }),
  date_arrive: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for dateArrive.",
  }),
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