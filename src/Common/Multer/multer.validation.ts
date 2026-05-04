import type { Request } from "express"
import type { FileFilterCallback } from "multer"
import { BadRequestException} from "../exceptions/domian.exceptions.js"

export const allowedFileFormates ={
    img:["image/png","image/jbg","image/jpeg"],
    video:["video/mp4",'video/mkv']
}



export function fileFilter(allowedFormates:string[]){
    return(req:Request,file:Express.Multer.File,cb:FileFilterCallback)=>{
    
    if(!allowedFormates.includes(file.mimetype)){
        return cb(new BadRequestException("invalid format"))
    }
    return cb(null,true)
        
  }}