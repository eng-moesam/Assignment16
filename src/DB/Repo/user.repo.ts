import type { ObjectId } from "mongoose";
import type { IUser } from "../Models/user.model.js";
import UserModel from "../Models/user.model.js";
import DBRepo from "./dbrepo.js";



class UserRepo extends DBRepo<IUser>{
    constructor(){
        super(UserModel)
    }
    public async checkUserExists(id:ObjectId):Promise<boolean>{
        return await this.findOne({filter:{_id:id}}) !==null
    }
}
export default new UserRepo()

