import { z } from "zod";
import { annonceSchema } from "../annonces/schema";
import { clientSchema } from "../utilisateurs/schema";


// Schéma pour l'objet principal
export const CommenteSchema = z.object({
  id: z.number(),              
  created_at: z.string(), 
  id_annonce: z.string(),
  id_client: z.string(), 
  annonce: annonceSchema.optional(),
  client: clientSchema.optional(),
  content: z.string(),         
  is_principal: z.boolean(),   
});

export type Commente = z.infer<typeof CommenteSchema>;
