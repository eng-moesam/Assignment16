import  express  from 'express';
import { auth } from '../../Middlewares/authentication.middleware.js';
import userService from './user.service.js';
import type { ObjectId } from 'mongoose';
import { validation } from '../../Middlewares/valdation.middleware.js';
import { logoutSchema, profilPicSchema } from './user.validation.js';
import successResponse from '../../Common/Response/success.response.js';
import cloudUpload from '../../Common/Multer/multer.config.js';
import { StorageApproachEnum } from '../../Common/enums/multer.enums.js';
import chatController from '../chat/chat.controller.js';

const userController =express.Router()

userController.use("/:userId/chat",chatController)

userController.get("/",auth(),async (req,res)=>{

    const result = await userService.getUserData(req.user)

    successResponse({res,data:result,statuscode:200})
    
})


userController.post("/upload-profile-pic",auth(),
validation(profilPicSchema),
cloudUpload({storageApporach:StorageApproachEnum.Memory}).single("profilePic"),async (req,res)=>{
   const resutlt = await userService.uploadProfilePic(req.user,req.body)
    return res.status(200).json({resutlt})
})
userController.post("/upload-cov-pic",auth(),
cloudUpload({storageApporach:StorageApproachEnum.Disk,fileSize:20}).array("covPic"),async (req,res)=>{
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