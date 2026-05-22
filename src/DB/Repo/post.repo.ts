import type { ObjectId } from "mongoose";
import DBRepo from "./dbrepo.js";
import PostModel, { type IPost } from "../Models/post.model.js";
import type { IHUser } from "../Models/user.model.js";
import { PostPrivacyEnum } from "../../Common/enums/post.enums.js";



class PostRepo extends DBRepo<IPost>{
    constructor(){
        super(PostModel)
    }
    public async checkPostExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
    checkPostPrivacy(user:IHUser){
        return [
            { privacy: PostPrivacyEnum.Public },
            { createBy: { $in: user.frindes! },
               privacy:PostPrivacyEnum.Friends },
            {tags:{$in:[user._id]}},
            {createBy:user._id},
         ]
    }
}
export default new PostRepo()

