import { z } from "zod";
import { roleSchema } from "../settings/schema";

export const adminSchema = z.object({
    id: z.string().uuid(), 
    aud: z.string().default("authenticated"), 
    role: z.string(), 
    email: z.string().email(),
    phone: z.string().optional(),
    is_anonymous: z.boolean(), 
    last_sign_in_at: z.string().datetime().optional(), 
    confirmed_at: z.string().datetime().nullable(),
    created_at: z.string().datetime(), 
    updated_at: z.string().datetime(), 
    email_confirmed_at: z.string().datetime().nullable(), 
    user_metadata: z.object({
      email: z.string().email(), 
      prenom:z.string().optional(),
      nom:z.string().optional(),
      email_verified: z.boolean(), 
      phone_verified: z.boolean(), 
      poste:roleSchema.optional(),
      sub: z.string(), 
    app_metadata: z.object({
      provider: z.string(), 
      providers: z.array(z.string()), 
    }),
    identities: z.array(
      z.object({
        identity_id: z.string().uuid(), 
        id: z.string().uuid(), 
        user_id: z.string().uuid(), 
        provider: z.string(), 
        created_at: z.string().datetime(),
        updated_at: z.string().datetime(), 
        identity_data: z.object({
          email: z.string().email(),
          email_verified: z.boolean(), 
          phone_verified: z.boolean(), 
        }),
      })
    ),
  }),
});


export type Admin = z.infer<typeof adminSchema>;
