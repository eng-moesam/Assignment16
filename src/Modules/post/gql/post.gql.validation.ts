import z from "zod"
import { commonValidationFileds } from "../../../Middlewares/valdation.middleware.js"

export const LikesOrDisLikesSchema = z.object({
  postId:commonValidationFileds.id,
  react:z.coerce.number()  
})