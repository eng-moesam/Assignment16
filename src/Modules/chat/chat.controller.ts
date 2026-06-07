import { Router } from "express"
import { auth } from "../../Middlewares/authentication.middleware.js";
import chatService from "./chat.service.js";
import successResponse from "../../Common/Response/success.response.js";
import cloudUpload from "../../Common/Multer/multer.config.js";
import { validation } from "../../Middlewares/valdation.middleware.js";
import { reactMessageSchema, sendGroupMessageSchema, sendMessageSchema } from "./chat.validation.js";

const chatController = Router()

chatController.get("/:userId", auth(), async (req, res) => {
    const result = await chatService.getChat(req.params.userId as string, req.user)

    successResponse({ res, data: result })
})

chatController.get("/group/:groupId", auth(), async (req, res) => {
    const result = await chatService.getGroupChat(req.params.groupId as string, req.user)

    successResponse({ res, data: result })
})

chatController.post("/create-group", auth(), cloudUpload({}).single("attachment"), async (req, res) => {
    const result = await chatService.createGroup(req.body.participants, req.body.groupName, req.file as Express.Multer.File, req.user)

    successResponse({ res, data: result })
})

chatController.post("/send", auth(),
    cloudUpload({}).array("attachments", 5),
    validation(sendMessageSchema, true),
    async (req, res) => {
        await chatService.sendMessage(req.body, req.user, req.files as Express.Multer.File[])
        return successResponse({ res, statuscode: 201 })
    })

chatController.post("/send-group", auth(),
    cloudUpload({}).array("attachments", 5),
    validation(sendGroupMessageSchema, true),
    async (req, res) => {
        await chatService.sendGroupMessage(req.body, req.user, req.files as Express.Multer.File[])
        return successResponse({ res, statuscode: 201 })
    })

chatController.post("/react/:chatId/:messageId", auth(),
    validation(reactMessageSchema),
    async (req, res) => {
        const result = await chatService.reactMessage(
            req.params.chatId as string,
            req.params.messageId as string,
            req.query.react as string,
            req.user
        )
        return successResponse({ res, statuscode: 201, data: result })
    })

export default chatController;
