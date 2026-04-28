import  express  from 'express';
import { auth } from '../../Middlewares/authentication.middleware.js';
import userService from './user.service.js';
import type { ObjectId } from 'mongoose';
import { validation } from '../../Middlewares/valdation.middleware.js';
import { logoutSchema } from './user.validation.js';
import successResponse from '../../Common/Response/success.response.js';

const userController =express.Router()

userController.get("/",auth(),(req,res)=>{

    return res.status(200).json({user:req.user})
    
})
userController.post("/logout",auth(),validation(logoutSchema),async (req,res,next) => {

         
 try {
         await userService.logOut(req.user._id  ,req.payload,req.body.logoutOptions)
        return successResponse({ res })
 
    } catch (error) {
        next(error)

    }})

export default userController