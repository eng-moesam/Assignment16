import S3BucketService from "../../Common/S3Bucket/s3bucket.config.js";
import { BadRequestException} from "../../Common/exceptions/domian.exceptions.js";
import storyRepo from "../../DB/Repo/story.repo.js";
import userRepo from "../../DB/Repo/user.repo.js";
import type { IHUser } from "../../DB/Models/user.model.js";
import type { StoryCreateDTO } from "./story.dto.js";

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

class StoryService {
    private _storyRepo = storyRepo;
    private _userRepo = userRepo;
    private _s3 = S3BucketService;

    async createStory(user: IHUser, file: Express.Multer.File | undefined, body: StoryCreateDTO) {
        if (!file) {
            throw new BadRequestException("story media is required");
        }

        const mediaKey = await this._s3.uploadFile({
            file,
            path: `user/${user._id}/story`,
        });

        const expiresAt = new Date(Date.now() + STORY_TTL_MS);

        const doc = await this._storyRepo.create({
            data: {
                createBy: user._id,
                mediaKey,
                caption: body.caption,
                expiresAt,
            },
        });
        return doc;
    }

   
}

export default new StoryService();
