import type { NextFunction, Request, Response } from "express"
import { tokenTypeEnum } from "../Common/enums/token.enums.js"
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../Common/exceptions/domian.exceptions.js"
import tokenService from "../Common/Security/token.service.js"

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
      const{user,verfiy}= await tokenService.checkTokenCode(tokenKey,tokenTypeParam)
    req.user=user
    
    req.payload=verfiy
    next()
  }  

  
}