import type { ObjectId } from "mongoose";
import DBRepo from "./dbrepo.js";
import type { IComment } from "../Models/comment.model.js";
import CommentModel from "../Models/comment.model.js";



class CommentRepo extends DBRepo<IComment>{
    constructor(){
        super(CommentModel)
    }
    public async checkCommentExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
    
}
export default new CommentRepo()

