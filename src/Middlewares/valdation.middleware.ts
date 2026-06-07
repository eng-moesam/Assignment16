import { z, type ZodType } from 'zod';
import type { NextFunction, Request, Response } from "express"
import { BadRequestException, MapGQLError } from "../Common/exceptions/domian.exceptions.js"
import { GenderEnum } from '../Common/enums/enums.user.js';
import { Types } from 'mongoose';

type keyRequest = keyof Request

export function validation(validationSchema: Partial<Record<keyRequest, ZodType>>,filesInBody=false) {
    // keyof Request => body,query parmes
    z.object()
    return (req: Request, res: Response, next: NextFunction) => {
        const valdationErrors: { path: PropertyKey[], message: string }[] = []
        for (const key of Object.keys(validationSchema) as keyRequest[]) {
            if (validationSchema[key] == undefined) {
                continue;
            }
            if(key == "body"&&filesInBody==true){
                req.body.files=req.files
            }
            const validation = validationSchema[key].safeParse(req[key])
            if (!validation.success) {
                valdationErrors.push(...validation.error.issues.map((ele) => {
                    return { path: ele.path, message: ele.message }
                }))
                // valdationErrors.push(JSON.parse(validation.error.message).map((ele)=>{
                //     return {path:ele.path,message:ele.message}
                // }))
            }

        }

        if (valdationErrors.length > 0) {
            //    throw new BadRequestException("valdation error",{error:JSON.parse(error as string)})
            throw new BadRequestException("valdation error", { valdationErrors })

        }
        next()
        //    if(!valdation.success){
        //     //    throw new BadRequestException("valdation error",{error:JSON.parse(error as string)})
        //        throw new BadRequestException("valdation error",{error:JSON.parse(valdation.error.message as string)})

        //    }
    }
}

export function validationGQL<T = any>(validationSchema: ZodType,value:T) {
    const validation = validationSchema.safeParse(value)
            if (!validation.success) {
                MapGQLError(new BadRequestException("validation Error",validation.error.issues.map((ele) => {
                    return { path: ele.path, message: ele.message }
                })))
            }
        
       
    
}
export function validationRealTime<T = any>(validationSchema: ZodType,value:T) {
    const validation = validationSchema.safeParse(value)
            if (!validation.success) {
                
                throw  new BadRequestException("validation Error",validation.error.issues.map((ele) => {
                    return { path: ele.path, message: ele.message }
                }))
            }
        
       
    
}

export const commonValidationFileds = {
    id:z.string().refine((value)=>{
          return Types.ObjectId.isValid(value)
        },"invalidObject id "),
    email: z.email(),
    password: z.string().regex(new RegExp(/(?=.*[a-z/)(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,16}/),{error:"password must be 6-16 and use A a #$%^"}),
    confrimPassword: z.string(),
    userName: z.string().min(3).max(20),
    gender: z.enum(GenderEnum),
    age: z.number().positive(),
    phone: z.string().regex(new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)),
    otp: z.string().regex(new RegExp(/\d{6}/))
}


