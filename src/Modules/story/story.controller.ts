import { Router } from "express";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { validation } from "../../Middlewares/valdation.middleware.js";
import successResponse from "../../Common/Response/success.response.js";
import cloudUpload from "../../Common/Multer/multer.config.js";
import { StorageApproachEnum } from "../../Common/enums/multer.enums.js";
import { allowedFileFormates } from "../../Common/Multer/multer.validation.js";
import storyService from "./story.service.js";
import { createStorySchema} from "./story.validation.js";

const storyController = Router();



storyController.post(
    "/",
    auth(),
    cloudUpload({
        storageApporach: StorageApproachEnum.Memory,
        fileSize: 20,
    }).single("media"),
    validation(createStorySchema),
    async (req, res, next) => {
        try {
            const data = await storyService.createStory(req.user, req.file, req.body);
            return successResponse({ res, statuscode: 201, data });
        } catch (err) {
            next(err);
        }
    }
);

export default storyController;
