import { RoleEnum } from "../../../Common/enums/enums.user.js"
import userRepo from "../../../DB/Repo/user.repo.js"
import authorizationGQL from "../../../Middlewares/authorization.middleware.js"
import { validationGQL } from "../../../Middlewares/valdation.middleware.js"
import type { ContextType } from "../../gql/type.gql.js"
import { getProfilePicschema } from "./user.gql.validation.js"






class UserResolver {
   private _userRepo = userRepo
   userProfile = async (parent:any,args:{userId:string},context:ContextType) => {
            
    authorizationGQL(context.user.role,[RoleEnum.User])
    validationGQL<{userId:string}>(getProfilePicschema,args)
    return context.user
          }
}

export default new UserResolver()