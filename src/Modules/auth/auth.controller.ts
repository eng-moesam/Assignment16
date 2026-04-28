import  express  from 'express';
import authService from './auth.service.js';
import successResponse from '../../Common/Response/success.response.js';
import type { loginDTO, singnUpDTO } from './auth.dto.js';

import z from "zod"
import { BadRequestException } from '../../Common/exceptions/domian.exceptions.js';
import { error } from 'node:console';
import { confrimEmailSchema, loginSchema, resendconfrimEmailSchema, resendForgetPassoerdOtpSchema, resetPasswordSchema, sendForgetPassoerdOtpSchema, signUpSchema, verfiyForgetPassoerdOtpSchema } from './auth.validation.js';
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
authController.post("/resend-otp-forget-password",validation(resendForgetPassoerdOtpSchema), async(req,res)=>{
     await authService.resendForgetPasswordOtp(req.body.email)
    
    return successResponse<string>({res,msg:"check your inbox"})
})
authController.post("/send-otp-forget-password",
    validation(sendForgetPassoerdOtpSchema), async(req,res)=>{
     await authService.sendOTPforgetPassword(req.body.email)
    
    return successResponse({res,msg:"check your inbox"})
})
authController.post("/verfiy-otp-forget-password",
    validation(verfiyForgetPassoerdOtpSchema), async(req,res)=>{
     await authService.verfiyOTPforgetPassword(req.body)
    
    return successResponse({res})
})

authController.post("/reset-password",
    validation(resetPasswordSchema), async(req,res)=>{
     await authService.resetPassword(req.body)
    
    return successResponse({res})
})

authController.post("/signup/gmail", async (req, res, next) => {

        const result = await authService.signupWithGmail(req.body.idToken)
        return res.status(201).json({ mes: "done", result })

   
})

export default authController