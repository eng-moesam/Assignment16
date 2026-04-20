import  express  from 'express';
import authService from './auth.service.js';
import successResponse from '../../Common/Response/success.response.js';
import type { loginDTO, singnUpDTO } from './auth.dto.js';

import z from "zod"
import { BadRequestException } from '../../Common/exceptions/domian.exceptions.js';
import { error } from 'node:console';
import { confrimEmailSchema, loginSchema, resendconfrimEmailSchema, signUpSchema } from './auth.validation.js';
import { validation } from '../../Middlewares/valdation.middleware.js';
const authController =express.Router()

authController.get("/",(req,res)=>{
    return res.status(200).send("auth page")
    
})

authController.post("/signUp",validation(signUpSchema),async (req,res,next)=>{

   
 const result = await authService.signUp(req.body)
    // console.log(result);
    
  return  res.status(200).json({msg:"done",result})
    
    

 
   
})
authController.post("/login",validation(loginSchema), async(req,res)=>{
    const result = await authService.login(req.body)
    console.log(result);

    
    return successResponse<{acsses_token:string,refresh_token:string}>({res,data:result})
})
authController.post("/confrim-email",validation(confrimEmailSchema), async(req,res)=>{
     await authService.confrimEmail(req.body)
    

    
    return successResponse<string>({res,msg:"done email confrimed"})
})
authController.post("/resend-confrim-email-otp",validation(resendconfrimEmailSchema), async(req,res)=>{
     await authService.resendOtpConfrimEmail(req.body.email)


    
    return successResponse<string>({res,msg:"check your inbox"})
})



export default authController