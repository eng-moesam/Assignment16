import {Router} from "express"
import successResponse from "../../Common/Response/success.response.js";
import cloudUpload from "../../Common/Multer/multer.config.js";
import { validation } from "../../Middlewares/valdation.middleware.js";
import { createPostSchema, findPostSchema, reactPostSchema, updatePostSchema } from "./post.validation.js";
import postService from "./post.service.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import type { Types } from "mongoose";
import { StorageApproachEnum } from "../../Common/enums/multer.enums.js";


 

const postController = Router()

postController.post("/",auth(),cloudUpload({}).array("attachments",5),
validation(createPostSchema,true),
async (req,res,next)=>{
    const data = await postService.createPost(req.body,req.user._id,req.files as Express.Multer.File[])
    return successResponse({res,statuscode:201,data})
})
postController.patch("/:postId",auth()
,cloudUpload({}).array("attachments",5),validation(updatePostSchema,true),
async (req,res,next)=>{
    const result = await postService.updatePost(req.body,req.params.postId as string,req.user._id,req?.files as Express.Multer.File[])
    return successResponse({res,statuscode:201})
})
postController.post("/react-post/:id",auth(),
validation(reactPostSchema),
async (req,res,next)=>{
    const result = await postService.likeOrDisLilkePost(req.params.id as string ,req.query.react as string,req.user)
    return successResponse({res,statuscode:201})
})

postController.get("/",auth(),validation(findPostSchema),async(req,res,next)=>{
    const result = await postService.findPost(req.user, req.query )
    return successResponse({res,statuscode:200,data:result})
})

export default postController;