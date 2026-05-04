import type { NextFunction, Request, Response } from "express"
import { tokenTypeEnum } from "../Common/enums/token.enums.js"
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../Common/exceptions/domian.exceptions.js"
import tokenService from "../Common/Security/token.service.js"
import type { JwtPayload } from "jsonwebtoken"
import type { RoleEnum } from "../Common/enums/enums.user.js"
import redisService from "../DB/Redis/redis.service.js"
import UserRepo from "../DB/Repo/user.repo.js"

export  function auth(tokenTypeParam=tokenTypeEnum.access){
  return async (req:Request,res:Response,next:NextFunction)=>{
        const {authorization} = req.headers
      if(!authorization){
        throw new UnauthorizedException("you need to login frist")

      }
     const[BearerKey,tokenKey]=  authorization.split(" ")
   
       if(BearerKey != "Bearer"){

        throw new BadRequestException("invalid Bearer Key ")

       }
         if(!tokenKey){
        throw new UnauthorizedException("you need to login frist")

      }
  const decoded= tokenService.decodedToken(tokenKey) as JwtPayload
     if(!decoded|| !decoded.aud){
        throw new UnauthorizedException("invalid token")
      }

  const [userRole,TokenType] = decoded.aud

   if (TokenType != tokenTypeParam){
    throw new UnauthorizedException("invalid token type");
   }
  
   const{accessSignature,refreshSignature}=tokenService.getSignature(Number(userRole) as RoleEnum)


     
  const verfiy = tokenService.verfiyToken({token:tokenKey,
    signature:tokenTypeParam==tokenTypeEnum.access?accessSignature:refreshSignature
    //   signature:
    //   tokenTypeEnum.refresh== TokenType ? refreshSignature:accessSignature 
  }) as JwtPayload

    if(verfiy.jti &&
     ( await redisService.get(redisService.getBlackListToken({userId:verfiy.sub!,tokenId:verfiy.jti}))
    )){
        throw new ConflictException("you need to sign again")
    }
    
    const user = await  UserRepo.findById({id:verfiy.sub as string})
    if (!user){
      throw new NotFoundException("invalid acount")
    }
    if(new Date(verfiy.iat!*1000)<user.changeCreditTime){
      throw new UnauthorizedException("you need to login again")
      
    }
    // console.log(verfiy.jti);
    
    req.user=user
    
    req.payload=verfiy
    next()
  }  

  
}