import type { Types } from "mongoose";
import DBRepo from "./dbrepo.js";
import StoryModel, { type IStory } from "../Models/story.model.js";

class StoryRepo extends DBRepo<IStory> {
    constructor() {
        super(StoryModel);
    }

}

export default new StoryRepo();
