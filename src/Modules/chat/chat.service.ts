import { Types } from "mongoose"
import notificationService from "../../Common/Notification/notification.service.js"
import s3bucketConfig from "../../Common/S3Bucket/s3bucket.config.js"
import redisService from "../../DB/Redis/redis.service.js"
import userRepo from "../../DB/Repo/user.repo.js"
import type { IHUser } from "../../DB/Models/user.model.js"
import chatRepo from "../../DB/Repo/chat.repo.js"
import { BadRequestException, NotFoundException } from "../../Common/exceptions/domian.exceptions.js"
import { ChatTypeEnum } from "../../Common/enums/chat.enums.js"
import { randomUUID } from "node:crypto"
import { StorageApproachEnum } from "../../Common/enums/multer.enums.js"

class ChatService {

   private _chatRepo = chatRepo
   private _userRepo = userRepo
   private _redisMethods = redisService
   private _S3BuketService = s3bucketConfig
   private _NotificationService = notificationService

   private async buildMessage(bodyData: any, user: IHUser, files?: Express.Multer.File[], path?: string) {
      const { content, tags } = bodyData
      const attachments = [...(bodyData.attachments || [])]

      if (tags?.length) {
         const mentionedUsers = await this._userRepo.find({ filter: { _id: { $in: tags } } })
         if (tags.length != mentionedUsers?.length) throw new BadRequestException("filed to fined")

         for (const tag of tags) {
            const tokens = await this._redisMethods.getFCMTokensSetMembers(tag)
            if (tokens.length) {
               await this._NotificationService.sendNotifications({
                  tokens,
                  data: { title: "chat taged", body: `you have taged on message` },
               })
            }
         }
      }

      if (files?.length) {
         const filesPaths = await this._S3BuketService.uploadFiles({
            files,
            path: path || `chat/${user._id}`,
            uploadApproach: StorageApproachEnum.Memory,
         })
         attachments.push(...filesPaths)
      }

      return { content, attachments, tags, createBy: user._id }
   }

   async getChat(participantId: string, user: IHUser) {
      const chat = await this._chatRepo.findOne({
         filter: {
            participants: { $all: [user._id, Types.ObjectId.createFromHexString(participantId)] },
            type: ChatTypeEnum.OVO
         },
         options: { populate: [{ path: "participants" }] }
      })

      if (!chat) {
         throw new BadRequestException("not found chat")
      }
      return chat
   }

   async sendMessage(bodyData: any, user: IHUser, files?: Express.Multer.File[]) {
      const message = await this.buildMessage(bodyData, user, files)
      const sendTo = Types.ObjectId.createFromHexString(bodyData.sendTo)

      const chat = await this._chatRepo.findOneAndUpdate({
         filter: { participants: { $all: [user._id, sendTo] }, type: ChatTypeEnum.OVO },
         update: { $push: { messages: message } }
      })


      if (!chat) {
         await this._chatRepo.create({
            data: {
               participants: [user._id, sendTo],
               messages: [message],
               createBy: user._id,
               type: ChatTypeEnum.OVO
            }
         })
      }
   }

   async createGroup(participants: string[], groupName: string, file: Express.Multer.File, user: IHUser) {
      const users = await this._userRepo.find({ filter: { _id: { $in: participants } } })
      if (users.length != participants.length) {
         throw new NotFoundException("Fail to find all users")
      }

      const roomId = randomUUID()
      const groub_image = file
         ? await this._S3BuketService.uploadFile({ file, path: `chat/groub/${roomId}` })
         : " "

      await this._chatRepo.create({
         data: {
            participants: [user._id, ...participants.map((id) => Types.ObjectId.createFromHexString(id))],
            createBy: user._id,
            type: ChatTypeEnum.OVM,
            groub: groupName,
            groub_image,
            roomId
         }
      })
   }

   async getGroupChat(groupId: string, user: IHUser) {
      const chat = await this._chatRepo.findOne({
         filter: { _id: groupId, participants: { $in: [user._id] }, type: ChatTypeEnum.OVM },
         options: { populate: [{ path: "participants" }] }
      })

      if (!chat) {
         throw new BadRequestException("not found groub chat")
      }
      return chat
   }

   async sendGroupMessage(bodyData: any, user: IHUser, files?: Express.Multer.File[]) {
      const message = await this.buildMessage(bodyData, user, files, `chat/group/${bodyData.groupId}`)

      const chat = await this._chatRepo.findOneAndUpdate({
         filter: { _id: bodyData.groupId, participants: { $in: [user._id] }, type: ChatTypeEnum.OVM },
         update: { $push: { messages: message } }
      })

      if (!chat) {
         throw new NotFoundException("not found group")
      }
      return chat.roomId
   }

   async reactMessage(chatId: string, messageId: string, react: number | string, user: IHUser) {
      const chat = await this._chatRepo.findOneAndUpdate({
         filter: { _id: chatId, participants: { $in: [user._id] }, "messages._id": messageId },
         update: react == 1
            ? { $addToSet: { "messages.$.likes": user._id } }
            : { $pull: { "messages.$.likes": user._id } },
         options: { returnDocument: "after" },
      })

      if (!chat) {
         throw new NotFoundException("not found message")
      }
      return chat
   }
}

export default new ChatService()
