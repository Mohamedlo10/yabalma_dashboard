import { z } from "zod";
import { roleSchema } from "../settings/schema";
export const UserSchema = z.object({
  id: z.string().uuid(),
  aud: z.string(),
  role: z.string(),
  email: z.string().nullable().optional(),
  last_sign_in_at: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  app_metadata: z.object({
    provider: z.string(),
    providers: z.array(z.string()),
  }),
  created_at: z.string().refine((date) => !isNaN(Date.parse(date))),
  updated_at: z.string().refine((date) => !isNaN(Date.parse(date))),
  phone: z.string().nullable(),
  confirmed_at: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  user_metadata: z.object({
    email:z.string().optional(),
    prenom:z.string().optional(),
    nom:z.string().optional(),
    email_verified:z.boolean().optional(),
    phone_verified:z.boolean().optional(),
    poste:roleSchema.optional(),
    sub:z.string().optional(),    

  }    
  ).nullable().optional(),

});


export type User = z.infer<typeof UserSchema>;
