import type { ObjectId } from "mongoose";
import DBRepo from "./dbrepo.js";
import PostModel, { type IPost } from "../Models/post.model.js";



class PostRepo extends DBRepo<IPost>{
    constructor(){
        super(PostModel)
    }
    public async checkPostExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
}
export default new PostRepo()

