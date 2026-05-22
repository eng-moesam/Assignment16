
import z, { size } from "zod"
import { PostPrivacyEnum } from "../../Common/enums/post.enums.js"
import { Types } from "mongoose"
import {commonValidationFileds}  from "../../Middlewares/valdation.middleware.js"
export const createPostSchema={
   body: z.object({
    content:z.string().min(3).max(1000).optional(),
     files:z.array(z.any()).optional(),
    tags:z.array(z.string()).optional(),
    privacy:z.coerce.number().default(PostPrivacyEnum.Public)
   }).superRefine((args,ctx)=>{
         if(!args.files?.length&&!args.content){
            ctx.addIssue({
                code:"custom",
                path:['content'],
                message:"you should add content at least or one atthchment"
            })
         }  

         for (const tag of args.tags as string[]) {
            if(Types.ObjectId.isValid(tag)){
                ctx.addIssue({
                   code:"custom",
                   path:["tags"],
                   message:`invalid tags objectId ${tag}` 
                })
            }
         }

         const UniqeTags =[ ...new Set(args.tags)]
          if(UniqeTags.length != args.tags?.length){
                      ctx.addIssue({
                   code:"custom",
                   path:["tags"],
                   message:`dublected tags ` 
                })
          }
        }),
  
}

export const findPostSchema={
   query: z.object({
      page:z.coerce.number().optional(),
      size:z.coerce.number().optional(),
      search:z.string().optional()
        }),
  
}


export const updatePostSchema={
   body: z.object({
    content:z.string().min(3).max(1000).optional(),
     files:z.array(z.any()).optional(),
     removefiles:z.array(z.any()).optional(),
    tags:z.array(commonValidationFileds.id).optional(),
    removeTags:z.array(commonValidationFileds.id).optional(),
    privacy:z.coerce.number().optional(),
   }).superRefine((args,ctx)=>{
         // if(!args.files?.length&&!args.content){
         //    ctx.addIssue({
         //        code:"custom",
         //        path:['content'],
         //        message:"you should add content at least or one atthchment"
         //    })
         // }  

         // for (const tag of args.tags as string[]) {
         //    if(Types.ObjectId.isValid(tag)){
         //        ctx.addIssue({
         //           code:"custom",
         //           path:["tags"],
         //           message:`invalid tags objectId ${tag}` 
         //        })
         //    }
         // }

         const UniqeTags =[ ...new Set(args.tags)]
          if(UniqeTags.length != args.tags?.length){
                      ctx.addIssue({
                   code:"custom",
                   path:["tags"],
                   message:`dublected tags ` 
                })
          }
        }),

  params:z.object({
   postId:commonValidationFileds.id
  })
}



export const reactPostSchema={
   query: z.object({
      react:z.coerce.number(),
        }),
  
}