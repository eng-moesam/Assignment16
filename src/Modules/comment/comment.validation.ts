
import z, { size } from "zod"
import { PostPrivacyEnum } from "../../Common/enums/post.enums.js"
import { Types } from "mongoose"
import { commonValidationFileds } from "../../Middlewares/valdation.middleware.js"
export const createCommentSchema = {
   body: z.object({
      content: z.string().min(3).max(1000).optional(),
      files: z.array(z.any()).optional(),
      tags: z.array(z.string()).optional(),
   }).superRefine((args, ctx) => {
      if (!args.files?.length && !args.content) {
         ctx.addIssue({
            code: "custom",
            path: ['content'],
            message: "you should add content at least or one atthchment"
         })
      }
      if (args.tags) {
         for (const tag of args.tags as string[]) {
            if (!Types.ObjectId.isValid(tag)) {
               ctx.addIssue({
                  code: "custom",
                  path: ["tags"],
                  message: `invalid tags objectId ${tag}`
               })
            }
         }

         const UniqeTags = [...new Set(args.tags)]
         if (UniqeTags.length != args.tags?.length) {
            ctx.addIssue({
               code: "custom",
               path: ["tags"],
               message: `dublected tags `
            })
         }
      }
   }),
   params: z.object({
      postId: commonValidationFileds.id
   })

}
export const replyCommentSchema = {
   body: z.object({
      content: z.string().min(3).max(1000).optional(),
      files: z.array(z.any()).optional(),
      tags: z.array(z.string()).optional(),
   }).superRefine((args, ctx) => {
      if (!args.files?.length && !args.content) {
         ctx.addIssue({
            code: "custom",
            path: ['content'],
            message: "you should add content at least or one atthchment"
         })
      }
      if (args.tags) {
         for (const tag of args.tags as string[]) {
            if (!Types.ObjectId.isValid(tag)) {
               ctx.addIssue({
                  code: "custom",
                  path: ["tags"],
                  message: `invalid tags objectId ${tag}`
               })
            }
         }

         const UniqeTags = [...new Set(args.tags)]
         if (UniqeTags.length != args.tags?.length) {
            ctx.addIssue({
               code: "custom",
               path: ["tags"],
               message: `dublected tags `
            })
         }
      }
   }),
   params: z.object({
      postId: commonValidationFileds.id,
      commentId: commonValidationFileds.id
   })

}

export const getCommentSchema = {
   params: z.object({
      commentId: commonValidationFileds.id
   }),

}


export const updateCommentSchema = {
   body: z.object({
      content: z.string().min(3).max(1000).optional(),
      files: z.array(z.any()).optional(),
      removefiles: z.array(z.any()).optional(),
      tags: z.array(commonValidationFileds.id).optional(),
      removeTags: z.array(commonValidationFileds.id).optional(),
   }).superRefine((args, ctx) => {
  

      const UniqeTags = [...new Set(args.tags)]
      if(args.tags){
      if (UniqeTags.length != args.tags?.length) {
         ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: `dublected tags `
         })
      }}
   }),

   params: z.object({
      commentId: commonValidationFileds.id
   })
}



export const reactCommentSchema = {
   query: z.object({
      react: z.coerce.number(),
   }),

}