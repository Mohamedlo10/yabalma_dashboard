import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const LogSchemma = z.object({
  logid: z.number(),
  message: z.string(),
  time: z.number(),
  userphone: z.string(),
  type:z.string(),
 
})

export type Log = z.infer<typeof LogSchemma>