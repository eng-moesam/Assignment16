   import z from "zod"
import { GenderEnum } from "../../Common/enums/enums.user.js"
import { commonValidationFileds } from "../../Middlewares/valdation.middleware.js"
   export const loginSchema={
    body:z.strictObject({
        email:commonValidationFileds.email,
        password:commonValidationFileds.password,
        FCM:z.string().optional()
    
  })
   }


  export const signUpSchema={
    body:loginSchema.body.extend({
        confrimPassword:commonValidationFileds.confrimPassword,
        userName:commonValidationFileds.userName,
        gender:commonValidationFileds.gender,
        age:commonValidationFileds.age.optional(),
        phone:commonValidationFileds.phone.optional()
    }).refine((data)=>{
      return   data.confrimPassword===data.password
    },{
    error:"confrim password not match password"}
)
   }


   export const confrimEmailSchema={
    body:z.strictObject({
        email:commonValidationFileds.email,
        otp:commonValidationFileds.otp,
    
  })
   }

   export const resendconfrimEmailSchema={
    body:z.strictObject({
        email:commonValidationFileds.email,
    
  })
   }
   export const resendForgetPassoerdOtpSchema={
    body:z.strictObject({
        email:commonValidationFileds.email,
    
  })
   }
   
   export const sendForgetPassoerdOtpSchema={
    body:z.strictObject({
        email:commonValidationFileds.email,
    
  })
   }
   export const verfiyForgetPassoerdOtpSchema={
    body:z.strictObject({
        email:commonValidationFileds.email,
        otp:commonValidationFileds.otp })
   }
   
   export const resetPasswordSchema={
    body:verfiyForgetPassoerdOtpSchema.body.extend({
        password:commonValidationFileds.password
    })
   }
  

   export const signupGmailSchema={
    body: z.object({
        idToken:z.string()
    })
   }