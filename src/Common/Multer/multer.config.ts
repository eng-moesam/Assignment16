import multer from "multer";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { StorageApproachEnum } from "../enums/multer.enums.js";
import { allowedFileFormates, fileFilter } from "./multer.validation.js";
console.log(tmpdir());

function cloudUpload({storageApporach=StorageApproachEnum.Memory,allowedFormates=allowedFileFormates.img,fileSize=5}:{
storageApporach?:StorageApproachEnum;
allowedFormates?:string[];
fileSize?:number
}){
    // const storage = multer.memoryStorage()
    const storage =storageApporach==StorageApproachEnum.Memory? multer.memoryStorage()
    : multer.diskStorage({
       destination(req, file, callback) {
          callback(null,tmpdir()) 
       },
       filename(req, file, callback) {
           callback(null,`${randomUUID()}_${file.originalname}`)
       },
    })

    return multer({storage,fileFilter:fileFilter(allowedFormates),limits:{fileSize:fileSize*1024*1024}})
}



export default cloudUpload