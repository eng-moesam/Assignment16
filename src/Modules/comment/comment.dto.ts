import type  z from "zod";
import type { createCommentSchema, updateCommentSchema } from "./comment.validation.js";





export type commentCreateDTO   = z.infer<typeof createCommentSchema.body>
export type updateCommentDTO   = z.infer<typeof updateCommentSchema.body>