import {Router} from "express"
import successResponse from "../../Common/Response/success.response.js";
import commentService from "./comment.service.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import cloudUpload from "../../Common/Multer/multer.config.js";
import { validation } from "../../Middlewares/valdation.middleware.js";
import { createCommentSchema, getCommentSchema, reactCommentSchema, replyCommentSchema, updateCommentSchema} from "./comment.validation.js";




 

const commentController = Router()
commentController.post("/react-comment/:id",auth(),
validation(reactCommentSchema),
async (req,res,next)=>{
    const data = await commentService.likeOrDisLilkeComment(req.params.id as string ,req.query.react as string,req.user)
    return successResponse({res,statuscode:201 ,data})
})
commentController.get("/getCommentData/:commentId",auth(),validation(getCommentSchema),
async (req,res,next)=>{
   const data = await commentService.getCommentDetails(req.params.commentId as string ,req.user)
    return successResponse({res,statuscode:200,data})
})
commentController.post("/:postId",auth(),cloudUpload({}).array("attachments",5),validation(createCommentSchema,true),
async (req,res,next)=>{
   const data = await commentService.createComment(req.body,req.user,req.params.postId as string ,req.files as Express.Multer.File[])
    return successResponse({res,statuscode:201,data})
})

commentController.post("/:postId/:commentId",auth(),cloudUpload({}).array("attachments",5),validation(replyCommentSchema,true),
async (req,res,next)=>{
   const data = await commentService.replyComment(req.body,req.user,req.params.postId as string ,req.params.commentId as string ,req.files as Express.Multer.File[])
    return successResponse({res,statuscode:201,data})
})
commentController.patch("/:commentId",auth()
,cloudUpload({}).array("attachments",5),validation(updateCommentSchema,true),
async (req,res,next)=>{
    const data = await commentService.updateComment(req.body,req.params.commentId as string,req.user._id,req?.files as Express.Multer.File[])
    return successResponse({res,statuscode:201,data})
})



export default commentController;