import type { NextFunction, Request, Response } from "express";
interface IError extends Error{
    statuscode:number
}
function globalErrHandling  (
    err:IError,req:Request,
    res:Response,
    next:NextFunction)
    {
         res.status(err.statuscode ||400).json({msg:err.message,cause:err.cause,stack:err.stack,err})
   }


   export default globalErrHandling