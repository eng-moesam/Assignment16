import { Schema, Types, model, type HydratedDocument } from "mongoose";

export interface IStory {
    createBy: Types.ObjectId;
    mediaKey: string;
    caption?: string;
    expiresAt: Date;
}
export type HIStory = HydratedDocument<IStory>


const storySchema = new Schema<IStory>(
    {
        createBy: { type: Types.ObjectId, ref: "User", required: true },
        mediaKey: { type: String, required: true },
        caption: { type: String },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);


storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const StoryModel = model<IStory>("Story", storySchema);

export default StoryModel;
