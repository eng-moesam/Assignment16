import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { TOKEN_SIGNATURE_ADMIN, TOKEN_SIGNATURE_ADMIN_Refresh, TOKEN_SIGNATURE_USER, TOKEN_SIGNATURE_USER_Refresh  } from '../../config/config.service.js';
import { RoleEnum } from '../enums/enums.user.js';
import {randomUUID} from "node:crypto"  
import { tokenTypeEnum } from '../enums/token.enums.js';
import type { IHUser, IUser } from '../../DB/Models/user.model.js';
import { ConflictException, NotFoundException, UnauthorizedException } from '../exceptions/domian.exceptions.js';
import userRepo from '../../DB/Repo/user.repo.js';
import redisService from '../../DB/Redis/redis.service.js';




class TokenService{

  private _userRepo = userRepo
  private _redisMethods= redisService
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


async checkTokenCode(tokenKey:string,tokenTypeParam=tokenTypeEnum.access){
  
  const decoded= this.decodedToken(tokenKey) as JwtPayload
     if(!decoded|| !decoded.aud){
        throw new UnauthorizedException("invalid token")
      }

  const [userRole,TokenType] = decoded.aud

   if (TokenType != tokenTypeParam){
    throw new UnauthorizedException("invalid token type");
   }
  
   const{accessSignature,refreshSignature}=this.getSignature(Number(userRole) as RoleEnum)


     
  const verfiy = this.verfiyToken({token:tokenKey,
    signature:tokenTypeParam==tokenTypeEnum.access?accessSignature:refreshSignature
    //   signature:
    //   tokenTypeEnum.refresh== TokenType ? refreshSignature:accessSignature 
  }) as JwtPayload

    if(verfiy.jti &&
     ( await this._redisMethods.get(this._redisMethods.getBlackListToken({userId:verfiy.sub!,tokenId:verfiy.jti}))
    )){
        throw new ConflictException("you need to sign again")
    }
    
    const user = await  this._userRepo.findById({id:verfiy.sub as string})
    if (!user){
      throw new NotFoundException("invalid acount")
    }
    if(new Date(verfiy.iat!*1000)<user.changeCreditTime){
      throw new UnauthorizedException("you need to login again")
      
    }
    // console.log(verfiy.jti);
    return {
      user,verfiy
    }
    
}

}

export default new TokenService()