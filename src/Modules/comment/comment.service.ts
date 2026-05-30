import type { Types } from "mongoose"
import notificationService from "../../Common/Notification/notification.service.js"
import s3bucketConfig from "../../Common/S3Bucket/s3bucket.config.js"
import redisService from "../../DB/Redis/redis.service.js"
import commentRepo from "../../DB/Repo/comment.repo.js"
import postRepo from "../../DB/Repo/post.repo.js"
import userRepo from "../../DB/Repo/user.repo.js"
import type { IHUser } from "../../DB/Models/user.model.js"
import { BadRequestException, NotFoundException } from "../../Common/exceptions/domian.exceptions.js"
import type { IPost } from "../../DB/Models/post.model.js"
import { StorageApproachEnum } from "../../Common/enums/multer.enums.js"
import type { updateCommentDTO } from "./comment.dto.js"



class commentService {

   private _commentRepo = commentRepo
   private _postRepo = postRepo
   private _userRepo = userRepo
   private _redisMethods = redisService
   private _S3BuketService = s3bucketConfig
   private _NotificationService = notificationService

   async createComment(bodyData: any, user: IHUser, postId: Types.ObjectId | string, files: Express.Multer.File[]) {


      const post = await this._postRepo.findOne({
         filter: {
            _id: postId,
            $or: this._postRepo.checkPostPrivacy(user)
         }
      })


      if (!post) {
         throw new NotFoundException("not found post")

      }
      const comment = this._commentRepo.getDBDoc(bodyData)


      if (bodyData.tags?.length) {
         const mentionedUsers = await this._userRepo.find({ filter: { _id: { $in: bodyData.tags } } })
         if (bodyData.tags.length != mentionedUsers?.length) {
            throw new BadRequestException("filed to fined")
         }

         for (const tag of bodyData.tags || []) {
            const tokens = await this._redisMethods.getFCMTokensSetMembers(tag)

            if (tokens.length) {
               await this._NotificationService.sendNotifications({
                  tokens, data: {
                     title: "comment taged",
                     body: JSON.stringify({ postId: comment._id as Types.ObjectId, message: `you have taged on comment` })
                  }
               })
            }
         }


      }


      if (files?.length) {
         const filesPaths = await this._S3BuketService.uploadFiles(
            {
               files: files as Express.Multer.File[],
               path: `/Post/${post._id}/comment/${comment._id}`,
               uploadApproach:StorageApproachEnum.Memory
            }
         )
         comment.attachments = filesPaths ;
      }


      comment.createBy = user._id as Types.ObjectId
      comment.postId = post._id

      return await comment.save()
   }

   async replyComment(bodyData: any, user: IHUser, postId: Types.ObjectId | string, commentId: Types.ObjectId | string, files: Express.Multer.File[]) {
   

      const parentComment = await this._commentRepo.findOne({
         filter: {
            _id: commentId,
            postId
         },
         options: {
            populate: [{ path: "postId", match: { $or: this._postRepo.checkPostPrivacy(user) } }]
         }
      })

      if (!parentComment || !(parentComment.postId as IPost)) { throw new NotFoundException("not found comment") }


      const comment = this._commentRepo.getDBDoc(bodyData)


      if (bodyData.tags?.length) {
         const mentionedUsers = await this._userRepo.find({ filter: { _id: { $in: bodyData.tags } } })
         if (bodyData.tags.length != mentionedUsers?.length) {
            throw new BadRequestException("filed to fined")
         }

         for (const tag of bodyData.tags || []) {
            const tokens = await this._redisMethods.getFCMTokensSetMembers(tag)

            if (tokens.length) {
               await this._NotificationService.sendNotifications({
                  tokens, data: {
                     title: "comment taged",
                     body: JSON.stringify({ postId: comment._id as Types.ObjectId, message: `you have taged on comment` })
                  }
               })
            }
         }


      }


      if (files?.length) {
         const filesPaths = await this._S3BuketService.uploadFiles(
            {
               files: files as Express.Multer.File[],
               path: `/Post/${postId}/comment/${comment._id}`,
               uploadApproach:StorageApproachEnum.Memory
            }
         )
         comment.attachments = filesPaths ;
      }


      comment.createBy = user._id as Types.ObjectId
      comment.postId = postId as Types.ObjectId
      comment.commentId = commentId as Types.ObjectId

      return await comment.save()
      // return await this._postRepo.saveDBDoc(post)
   }


   async getCommentDetails(commentId: Types.ObjectId | string, user: IHUser) {


      const comment = await this._commentRepo.findById({

         id: commentId,
         options:{
            populate:[
               {path:"postId",
            match:{$or:this._postRepo.checkPostPrivacy(user)}
         },
         {path:"commentId"},
         {path:"replies"}
      ]}
      }

      )


      if (!comment || !comment.postId) {
         throw new NotFoundException("not found comment")

      }
    
      return comment

   }

   async likeOrDisLilkeComment(commentId: Types.ObjectId | string,react:number|string,user:IHUser){
         const updateQuery = react == 1 ?{$addToSet:{likes:user._id}}: {$pull:{likes:user._id}}
         const comment = await this._commentRepo.findOneAndUpdate({
            filter:{
               _id:commentId,
            },
            update: updateQuery,
            options:{returnDocument:"after"}
         })
   
         if(!comment){
            throw new NotFoundException("not found comment")
         }
   
         return comment
      }


      
         async updateComment(bodyData: updateCommentDTO, commentId: Types.ObjectId | string, userId: Types.ObjectId | string, files: Express.Multer.File[]) {
            //  const {tags} = bodyData
      
            const comment = await this._commentRepo.findOne({ filter: { _id: commentId, createBy: userId } })
      
            if (!comment) {
               throw new NotFoundException("not found comment")
            }
      
            if (!comment.content && !bodyData.content && !comment.attachments?.length && !files?.length && comment.attachments?.length == bodyData.removefiles?.length) {
      
               throw new BadRequestException("you can leave comment embty")
      
            }
      
      
      
      
      
            if (bodyData.tags?.length) {
               const mentionedUsers = await this._userRepo.find({ filter: { _id: { $in: bodyData.tags } } })
               if (bodyData.tags.length != mentionedUsers?.length) {
                  throw new BadRequestException("filed to fined")
               }
      
      
      
            }
      
            let uploadFiles: string[] = []
            if (files?.length) {
               const filesPaths = await this._S3BuketService.uploadFiles(
                  {
                     files: files as Express.Multer.File[],
                     path: `/Comment/${comment._id}`,
                     uploadApproach:StorageApproachEnum.Memory
                  }
               )
               uploadFiles = filesPaths
            }
      
            if (bodyData.removefiles?.length) {
               const removedFiles: { Key: string }[] = bodyData.removefiles.map((path) => {
                  return { Key: path }
               })
               await this._S3BuketService.DeleteFiles(removedFiles)
            }
      
            for (const tag of bodyData.tags || []) {
               const tokens = await this._redisMethods.getFCMTokensSetMembers(tag)
      
               if (tokens.length) {
                  await this._NotificationService.sendNotifications({
                     tokens, data: {
                        title: "post taged",
                        body: JSON.stringify({ postId: comment._id as Types.ObjectId, message: `you have taged on post` })
                     }
                  })
               }
            }
            
         
          return await this._commentRepo.findOneAndUpdate({
            filter:{_id:commentId},
            update:[
               {$set:{
                  content:bodyData.content||comment.content,
                  
      
                 tags:{
                  $setUnion:[
                     {
                        $setDifference:[
                           "$tags",bodyData.removeTags||[]
                        ]
      
                     },
                     bodyData.tags ||[]
                  ]
                 },
                 attachments:{
                  $setUnion:[
                     {
                        $setDifference:[
                           "$attachments",bodyData.removefiles||[]
                        ]
      
                     },
                     uploadFiles
                  ]
                 }
      
               }}
            ],
            options:{
               updatePipeline:true,
               returnDocument:"after"
            }
          })
              
      
         }
      

}


export default new commentService()