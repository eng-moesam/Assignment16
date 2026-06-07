import { Types, type HydratedDocument } from "mongoose";
import { PostPrivacyEnum } from "../../Common/enums/post.enums.js";
import { Schema } from "mongoose";
import { model } from "mongoose";
import { ChatTypeEnum } from "../../Common/enums/chat.enums.js";

export interface IMessage {
    content?: string;
    attachments?: string[];

    likes?: Types.ObjectId[];
    tags?: Types.ObjectId[];

    createBy: Types.ObjectId;

    deletedAt: Date;
}

export interface IChat {
    participants: Types.ObjectId[];

    messages: IMessage[]
    // content?:string;
    // attachments?:string[];
    type: ChatTypeEnum
    groub: string;
    groub_image: string;
    roomId: string;
    likes?: Types.ObjectId[];
    tags?: Types.ObjectId[];
    createBy: Types.ObjectId;
    // privacy:ChatPrivacyEnum;
    deletedAt: Date;
}


export type HIChat = HydratedDocument<IChat>


const messageSchema = new Schema<IMessage>({
    content: {
        type: String,
        required: function (): boolean {
            return !this.attachments?.length
        }
    },
    attachments: [String],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],

    createBy: { type: Types.ObjectId, ref: "User", required: true },
    deletedAt: Date
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})



const chatSchema = new Schema<IChat>({

    participants: [{ type: Types.ObjectId, ref: "User" }],
    messages:[messageSchema],
    type: {type:String,enum:ChatTypeEnum,default:ChatTypeEnum.OVO},
    groub: {
      type:String,
        required: function (): boolean {
            return this.type == ChatTypeEnum.OVM
        }
    },
    groub_image: {
        type:String,
        required: function (): boolean {
            return this.type == ChatTypeEnum.OVM
        }
    },
    roomId: {
       type: String,
        required: function (): boolean {
            return this.type == ChatTypeEnum.OVM
        }
    },

    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    //  privacy:{
    //     type:Number,
    //     enum:ChatPrivacyEnum,
    //     default:ChatPrivacyEnum.Public
    //  },
    createBy: { type: Types.ObjectId, ref: "User", required: true },
    deletedAt: Date
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})


chatSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery()
    if (!query.getSoftDelete) {

        this.setQuery({ ...query, deletedAt: { $exists: false } })
    }


})

chatSchema.virtual("comments", {
    localField: "_id",
    foreignField: "ChatId",
    ref: "Comment",
    justOne: true,
})


const ChatModel = model<IChat>('Chat', chatSchema);

export default ChatModel





