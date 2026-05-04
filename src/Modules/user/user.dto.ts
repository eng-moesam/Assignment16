import type  z from "zod";
import type { profilPicSchema } from "./user.validation.js";





export type profilePicDTO   = z.infer<typeof profilPicSchema.body>