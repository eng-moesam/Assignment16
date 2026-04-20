import type { Response } from "express";

function successResponse<T>({res,statuscode=200, msg="done",data}:{res:Response,statuscode?:number,msg?:string,data?:T}){
    return res.status(statuscode).json({msg,data})

}



export default successResponse