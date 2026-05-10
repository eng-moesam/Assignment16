import type  z from "zod";
import type { createPostSchema } from "./post.validation.js";





export type postCreateDTO   = z.infer<typeof createPostSchema.body>