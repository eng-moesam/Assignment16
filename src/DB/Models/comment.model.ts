import { Types, type HydratedDocument } from "mongoose";
import { Schema } from "mongoose";
import { model } from "mongoose";
import type { IPost } from "./post.model.js";



export interface IComment {
    content?: string;
    attachments?: string[];
    likes?: Types.ObjectId[];
    tags?: Types.ObjectId[];
    createBy: Types.ObjectId;
    postId: Types.ObjectId | IPost;
    commentId: Types.ObjectId;
    deletedAt: Date;
}


export type HIComment = HydratedDocument<IComment>


const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: function (): boolean {
            return !this.attachments?.length
        }
    },
    attachments: [String],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Types.ObjectId, ref: "Comment" },
    createBy: { type: Types.ObjectId, ref: "User", required: true },
    deletedAt: Date
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }

})


commentSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery()
    if (!query.getSoftDelete) {

        this.setQuery({ ...query, deletedAt: { $exists: false } })
    }


})

commentSchema.virtual("replies", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment",
    justOne: true,
})



const CommentModel = model<IComment>('Comment', commentSchema);

export default CommentModel




