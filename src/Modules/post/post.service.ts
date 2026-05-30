import type { Types } from "mongoose";
import type { findpostDTO, postCreateDTO, updatepostDTO } from "./post.dto.js";
import postRepo from "../../DB/Repo/post.repo.js";
import userRepo from "../../DB/Repo/user.repo.js";
import { BadRequestException, NotFoundException } from "../../Common/exceptions/domian.exceptions.js";
import redisService from "../../DB/Redis/redis.service.js";
import notificationService from "../../Common/Notification/notification.service.js";
import s3bucketConfig from "../../Common/S3Bucket/s3bucket.config.js";
import { PostPrivacyEnum } from "../../Common/enums/post.enums.js";
import type { IHUser } from "../../DB/Models/user.model.js";
import { StorageApproachEnum } from "../../Common/enums/multer.enums.js";


class PostServise {

   private _postRepo = postRepo
   private _userRepo = userRepo
   private _redisMethods = redisService
   private _S3BuketService = s3bucketConfig
   private _NotificationService = notificationService

   async createPost(bodyData: any, userId: Types.ObjectId | string, files: Express.Multer.File[]) {
            const post = this._postRepo.getDBDoc(bodyData )

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
                  title: "post taged",
                  body: JSON.stringify({ postId: post._id as Types.ObjectId, message: `you have taged on post` })
               }
            })
         }
      }


      }
       

      if (files?.length) {
         const filesPaths = await this._S3BuketService.uploadFiles(
            {
               files: files as Express.Multer.File[],
               path: `/Post/${post._id}`,
               uploadApproach:StorageApproachEnum.Memory
            }
         )
         post.attachments = filesPaths ;
      }
     

      post.createBy = userId as Types.ObjectId


      // return await post.save()
      return await this._postRepo.saveDBDoc(post)
   }

   async updatePost(bodyData: updatepostDTO, postId: Types.ObjectId | string, userId: Types.ObjectId | string, files: Express.Multer.File[]) {
      //  const {tags} = bodyData

      const post = await this._postRepo.findOne({ filter: { _id: postId, createBy: userId } })

      if (!post) {
         throw new NotFoundException("not found post")
      }

      if (!post.content && !bodyData.content && !post.attachments?.length && !files?.length && post.attachments?.length == bodyData.removefiles?.length) {

         throw new BadRequestException("you can leave post embty")

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
               path: `/Post/${post._id}`
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
                  body: JSON.stringify({ postId: post._id as Types.ObjectId, message: `you have taged on post` })
               }
            })
         }
      }
      
   
    return await this._postRepo.findOneAndUpdate({
      filter:{_id:postId},
      update:[
         {$set:{
            content:bodyData.content||post.content,
            privacy:bodyData.privacy|| post.privacy,

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

   async findPost(user: IHUser, queryData: findpostDTO) {

      const searchQuery = queryData.search?.length ? { content: { $regex: queryData.search as string, $options: "i" } } : {}
      return await this._postRepo.paginate({
         filter: {
            $or: this._postRepo.checkPostPrivacy(user),
            ...searchQuery
         },
         page: queryData.page as number,
         size: queryData.size as number,
         options:{
            populate:[{path:"comments",populate:{path:"replies"}}]//{path:"commentId"}
         }
         
      })
   }


   async likeOrDisLilkePost(postId: Types.ObjectId | string,react:number|string,user:IHUser){
      const updateQuery = react == 1 ?{$addToSet:{likes:user._id}}: {$pull:{likes:user._id}}
      const post = await this._postRepo.findOneAndUpdate({
         filter:{
            _id:postId,
            $or:this._postRepo.checkPostPrivacy(user)
         },
         update: updateQuery,
         options:{returnDocument:"after"}
      })

      if(!post){
         throw new NotFoundException("not found post")
      }

      return post
   }
}

export default new PostServise()