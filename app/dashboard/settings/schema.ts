import { z } from "zod";

export const roleSchema = z.object({
  id: z.number().optional(),
  nom: z.string(),
  access_groups: z.record(z.boolean()), 
  created_at: z.string().optional(),
});

export type Role = z.infer<typeof roleSchema>;


