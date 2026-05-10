import type { Types } from "mongoose";
import type { postCreateDTO } from "./post.dto.js";
import postRepo from "../../DB/Repo/post.repo.js";
import userRepo from "../../DB/Repo/user.repo.js";
import { BadRequestException } from "../../Common/exceptions/domian.exceptions.js";
import redisService from "../../DB/Redis/redis.service.js";
import notificationService from "../../Common/Notification/notification.service.js";


class PostServise{
    
    private _postRepo = postRepo
    private _userRepo =userRepo
    private _redisMethods = redisService
    private _NotificationService = notificationService
    
    async createPost(bodyData:postCreateDTO,userId:Types.ObjectId){
       const {tags} = bodyData
        if(tags?.length){
            const mentionedUsers = await this._userRepo.find({filter:{_id:{$in:tags}}})
         if(tags.length != mentionedUsers?.length){
            throw new BadRequestException("filed to fined")
         }
         
         for(const tag of tags ){
            const tokens = await this._redisMethods.getFCMTokensSetMembers(tag)

            if(tokens.length){
               await this._NotificationService.sendNotifications({tokens,data:{
                title:"post taged",
                body:`you have taged on post`
               }})
            }
         }

        }
    }
}

export default new PostServise()