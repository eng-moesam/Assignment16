import {Router} from "express"
import successResponse from "../../Common/Response/success.response.js";
import cloudUpload from "../../Common/Multer/multer.config.js";
import { validation } from "../../Middlewares/valdation.middleware.js";
import { createPostSchema } from "./post.validation.js";


 

const postController = Router()

postController.post("/",cloudUpload({}).array("attachments",5),validation(createPostSchema,true),(req,res,next)=>{
    return successResponse({res,statuscode:201})
})

export default postController;