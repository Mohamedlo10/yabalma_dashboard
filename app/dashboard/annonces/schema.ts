import { z } from "zod";
import { userSchema } from "../utilisateurs/gp/data/schema";

export const annonceSchema = z.object({
  id: z.string(), 
  idGp: z.string(),
  gp:userSchema.optional(),
  tarif: z.number().positive(),  
  lieuCollecte: z.string().min(1),  
  paysDepart: z.object({
    pays: z.string(),
    code: z.string().length(2), 
  }),
  paysArrive: z.object({
    pays: z.string(),
    code: z.string().length(2), 
  }),
  limitDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for limitDate.",
  }),
  dateDepart: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for dateDepart.",
  }),
  dateArrive: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for dateArrive.",
  }),
  created_at: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format for created_at.",
  }),
  read: z.boolean(),
});

export type Annonce = z.infer<typeof annonceSchema>;
