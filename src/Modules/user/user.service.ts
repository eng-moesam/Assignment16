import type { JwtPayload } from "jsonwebtoken";
import * as Exceptions from "../../Common/exceptions/domian.exceptions.js"
import type { Types } from "mongoose";
import userRepo from "../../DB/Repo/user.repo.js";
import redisService from "../../DB/Redis/redis.service.js";

class UserService{
    private _userRepo = userRepo
    private _redisMethods = redisService

 async  logOut(userId:Types.ObjectId|string, tokenData:JwtPayload, logoutOptions:string) {
//    console.log(tokenData);
//    console.log({ "tokenData.jti": tokenData.jti });
   if (!tokenData || !tokenData.jti) {
      console.error("Missing tokenData or jti:", tokenData);
      throw new Exceptions.ConflictException("Invalid token data");
   }


   if (logoutOptions == "all") {
      await this._userRepo.updateOne({ filter: { _id: userId }, data: { changeCreditTime: new Date() } })
   }
   else {
      // await dbRepo.create({model:tokenModel,data:{
      //    jti:tokenData.jti,
      //    userId,
      //    expiredIn:(tokenData.iat + 60*60*24*365)*1000,
      // }})
      const expirationSeconds = (60 * 60 * 24 * 365) - (Date.now() / 1000 - Number(tokenData.iat));
      const finalExpiry = Math.max(Math.floor(expirationSeconds));

      await this._redisMethods.set({
         key: this._redisMethods.getBlackListToken({userId,tokenId:tokenData.jti}),
         value: tokenData.jti,
         exValue: finalExpiry
         // (60*60*24*365) -(Date.now()/1000-tokenData.iat)})
      })



   }
}
}


export default new UserService()