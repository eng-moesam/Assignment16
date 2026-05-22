
import { GraphQLNonNull, GraphQLString } from "graphql"
import userRepo from "../../../DB/Repo/user.repo.js"
import userResolver from "./user.resolver.js"
import { userProfileTypes } from "./user.types.js"
import {  userProfileArgs } from "./user.args.js"

class UserSchema{
 

    userQueries(){
        return {
            
        getUserProfile: {
          type:userProfileTypes,
          args:userProfileArgs.userId,
          resolve:userResolver.userProfile,
          description: "get user profile"
        }
        }
    }
}


export default new UserSchema()