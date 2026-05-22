import type  z from "zod";
import type { createPostSchema, findPostSchema, updatePostSchema } from "./comment.validation.js";





export type postCreateDTO   = z.infer<typeof createPostSchema.body>

export type findpostDTO   = z.infer<typeof findPostSchema.query>
export type updatepostDTO   = z.infer<typeof updatePostSchema.body>