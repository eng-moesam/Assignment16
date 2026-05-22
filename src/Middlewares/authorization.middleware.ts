import { GraphQLError } from "graphql";
import type { RoleEnum } from "../Common/enums/enums.user.js";
import { MapGQLError, UnauthorizedException } from "../Common/exceptions/domian.exceptions.js";



function authorizationGQL(userRole:RoleEnum,endPointRoles:RoleEnum[]){


    if(!endPointRoles.includes(userRole)){
         MapGQLError( new UnauthorizedException("you dont have access"))
    }
}

export default authorizationGQL