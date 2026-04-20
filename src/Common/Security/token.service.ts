import jwt, { type SignOptions } from 'jsonwebtoken';
import { TOKEN_SIGNATURE_ADMIN, TOKEN_SIGNATURE_ADMIN_Refresh, TOKEN_SIGNATURE_USER, TOKEN_SIGNATURE_USER_Refresh  } from '../../config/config.service.js';
import { RoleEnum } from '../enums/enums.user.js';
import {randomUUID} from "node:crypto"  
import { tokenTypeEnum } from '../enums/token.enums.js';
import type { IHUser, IUser } from '../../DB/Models/user.model.js';




class TokenService{
  constructor(){}


 getSignature(role :RoleEnum = RoleEnum.User) {

         let refreshSignature=""
         let accessSignature=""
         switch (role) {
          case RoleEnum.User:
            refreshSignature=TOKEN_SIGNATURE_USER_Refresh 
            accessSignature=TOKEN_SIGNATURE_USER
            break;
          case RoleEnum.Admin:
            refreshSignature=TOKEN_SIGNATURE_ADMIN_Refresh 
            accessSignature=TOKEN_SIGNATURE_ADMIN
            break;
          default:
      throw new Error("Invalid role for token signature");
          
         }
    return {accessSignature,refreshSignature}
}

 generateToken({payload={},signature,options={}}:{
  payload:object,
  signature:string,
  options?:SignOptions
}){
    return jwt.sign(payload,signature,options); 
}

 verfiyToken({token,signature}:{token:string,signature:string}){
    return jwt.verify(token,signature)
}
 decodedToken(token:string){
    return jwt.decode(token)
}


 genratesignToken(user:IHUser){

     const { accessSignature, refreshSignature } = this.getSignature(user.role)
        const jid= randomUUID()
          const acsses_token = this.generateToken({payload:{ sub:user._id,
          }
            ,signature:accessSignature,
            options:{
            audience:[String(user.role),tokenTypeEnum.access] ,
            expiresIn:60*60,
            jwtid:jid
          }})
    
           const refresh_token =this.generateToken({payload:{ sub:user._id},signature:refreshSignature,
            options:{
            audience:[String(user.role),tokenTypeEnum.refresh] ,
            expiresIn:"1y",
            jwtid:jid

          }})
        
     
         return  {acsses_token,refresh_token} 
}


}

export default new TokenService()