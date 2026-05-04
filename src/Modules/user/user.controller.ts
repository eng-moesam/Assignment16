import  express  from 'express';
import { auth } from '../../Middlewares/authentication.middleware.js';
import userService from './user.service.js';
import type { ObjectId } from 'mongoose';
import { validation } from '../../Middlewares/valdation.middleware.js';
import { logoutSchema } from './user.validation.js';
import successResponse from '../../Common/Response/success.response.js';
import cloudUpload from '../../Common/Multer/multer.config.js';
import { StorageApproachEnum } from '../../Common/enums/multer.enums.js';

const userController =express.Router()

userController.get("/",auth(),(req,res)=>{

    return res.status(200).json({user:req.user})
    
})
userController.post("/upload-profile-pic",auth(),
cloudUpload({storageApporach:StorageApproachEnum.Memory}).single("profilePic"),async (req,res)=>{
   const resutlt = await userService.uploadProfilePic(req.file!,req.user)
    return res.status(200).json({resutlt})
    
})
userController.post("/upload-cov-pic",auth(),
cloudUpload({storageApporach:StorageApproachEnum.Disk}).array("covPic"),async (req,res)=>{
   const resutlt = await userService.uploadcovPic(req.files as Express.Multer.File[] ,req.user)
    return res.status(200).json({resutlt})
    
})
userController.delete("/",auth(),async (req,res)=>{
   const resutlt = await userService.deleteUser(req.user)
    return res.status(200).json({resutlt})
    
})
userController.post("/logout",auth(),validation(logoutSchema),async (req,res,next) => {

         
 try {
         await userService.logOut(req.user._id  ,req.payload,req.body.logoutOptions)
        return successResponse({ res })
 
    } catch (error) {
        next(error)

    }})

export default userController