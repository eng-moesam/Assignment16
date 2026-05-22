import {Router} from "express"
import successResponse from "../../Common/Response/success.response.js";
import commentService from "./comment.service.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import cloudUpload from "../../Common/Multer/multer.config.js";




 

const commentController = Router()

commentController.post("/:postId",auth(),cloudUpload({}).array("attachments",5),
async (req,res,next)=>{
   const data = await commentService.createComment(req.body,req.user,req.params.postId as string ,req.files as Express.Multer.File[])
    return successResponse({res,statuscode:201,data})
})

commentController.post("/:postId/:commentId",auth(),cloudUpload({}).array("attachments",5),
async (req,res,next)=>{
   const data = await commentService.replyComment(req.body,req.user,req.params.postId as string ,req.params.commentId as string ,req.files as Express.Multer.File[])
    return successResponse({res,statuscode:201,data})
})
commentController.get("/getCommentData/:commentId",auth(),
async (req,res,next)=>{
   const data = await commentService.getCommentDetails(req.params.commentId as string ,req.user)
    return successResponse({res,statuscode:200,data})
})

export default commentController;