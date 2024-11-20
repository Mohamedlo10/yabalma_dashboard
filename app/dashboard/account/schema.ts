import { z } from "zod";

export const adminSchema = z.object({
    identity_id: z.string().uuid(),
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    identity_data: z.object({
      email: z.string().email(),
      email_verified: z.boolean(),
      phone_verified: z.boolean(),
      // Ajouter d'autres champs si nécessaire dans `identity_data`
    }),
    email: z.string().email(),
    email_verified: z.boolean(),
    phone_verified: z.boolean(),
    sub: z.string(),
    provider: z.enum(["email", "google", "facebook"]), // Ajouter d'autres providers si nécessaire
    last_sign_in_at: z.string().datetime(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export type Admin = z.infer<typeof adminSchema>;
