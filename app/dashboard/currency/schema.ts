import { z } from "zod";

export const currencySchema = z.object({
  id: z.number().optional(),
  created_at: z.string().optional(),
  currency: z.string().min(1, "La devise est requise"),
  value: z.number().positive("La valeur doit être positive"),
});

export type Currency = z.infer<typeof currencySchema>; 