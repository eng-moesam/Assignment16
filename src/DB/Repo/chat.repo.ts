import type { ObjectId } from "mongoose";
import DBRepo from "./dbrepo.js";
import ChatModel, { type IChat } from "../Models/chat.model.js";



class ChatRepo extends DBRepo<IChat>{
    constructor(){
        super(ChatModel)
    }
    public async checkChatExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
   
}
export default new ChatRepo()

