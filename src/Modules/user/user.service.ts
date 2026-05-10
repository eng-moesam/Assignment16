import type { JwtPayload } from "jsonwebtoken";
import * as Exceptions from "../../Common/exceptions/domian.exceptions.js"
import type { Types } from "mongoose";
import userRepo from "../../DB/Repo/user.repo.js";
import redisService from "../../DB/Redis/redis.service.js";
import S3BucketService from "../../Common/S3Bucket/s3bucket.config.js"
import type { IHUser } from "../../DB/Models/user.model.js";
import type { profilePicDTO } from "./user.dto.js";
import { StorageApproachEnum } from "../../Common/enums/multer.enums.js";
class UserService {
   private _userRepo = userRepo
   private _redisMethods = redisService
   private _S3BuketServise = S3BucketService
  
   async logOut(userId: Types.ObjectId | string, tokenData: JwtPayload, logoutOptions: string) {
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
            key: this._redisMethods.getBlackListToken({ userId, tokenId: tokenData.jti }),
            value: tokenData.jti,
            exValue: finalExpiry
            // (60*60*24*365) -(Date.now()/1000-tokenData.iat)})
         })



      }
   }

   async uploadProfilePic( user: IHUser,bodyData:profilePicDTO) {
      // const Key = await this._S3BuketServise.uploadFile({ file, path: `user/${user._id}/profilrPic` })
      const {originalname,ContentType}=bodyData
      const Key = await this._S3BuketServise.createPresignedUploadFile({ originalname,ContentType, path: `user/${user._id}/profilrPic` })
      if(user.profilePic){
         await this._S3BuketServise.DeleteFile(user.profilePic)
      }
      // user.profilePic = Key.key
      // await user.save()

      return Key

   }

   async uploadcovPic(files: Express.Multer.File[], user: IHUser) {
      // const Key=  await this._S3BuketServise.uploadFile({file,path:"user"})


      const Key = await this._S3BuketServise.uploadFiles({ files, path: `user/${user._id}/covPic` })

      user.covPic = Key
      await user.save()
      return Key

   }
    
   async deleteUser(user:IHUser){
       

    const files= await  this._S3BuketServise.listFoldersKeys(`user/${user._id}`)
    const Keys =files.Contents?.map(files=>{

         return {Key:files.Key}
      })
    
     await this._S3BuketServise.DeleteFiles(Keys as {Key:string}[])

    
    await user.deleteOne()
    
   

   }
}



export default new UserService()