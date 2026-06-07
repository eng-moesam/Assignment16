import type { Server } from "socket.io"
import type { SocketAuthType } from "../../../Common/Interfaces/express.interface.js"
import redisService from "../../../DB/Redis/redis.service.js"
import { validationRealTime } from "../../../Middlewares/valdation.middleware.js"
import chatService from "../chat.service.js"
import { ChatTypeEnum } from "../../../Common/enums/chat.enums.js"
import {
    reactMessageSocketSchema,
    sendGroupMessageSocketSchema,
    sendMessageSocketSchema,
    testSchema,
} from "../chat.validation.js"

class ChatEvnts {
    private _chatService = chatService
    private _redisService = redisService

    getChatEvent(socket: SocketAuthType) {
        socket.on("getChat", async (args) => {
            validationRealTime(testSchema, { chatId: args })
        })
    }

    sendMessage(socket: SocketAuthType, io: Server) {
        return socket.on("sendMessage", async (args) => {
            validationRealTime(sendMessageSocketSchema, args)

            await this._chatService.sendMessage(args, socket.data.user)
            const socketIds = await this._redisService.getMembersSocketIoIds(socket.data.user._id)
            io.to(socketIds).emit("successMessage", args)

            const socketIdsAntorUser = await this._redisService.getMembersSocketIoIds(args.sendTo)
            if (socketIdsAntorUser.length) {
                io.to(socketIdsAntorUser).emit("successMessage", {
                    content: args.content,
                    tags: args.tags,
                    attachments: args.attachments,
                    from: socket.data.user
                })
            }
        })
    }

    sendGroupMessage(socket: SocketAuthType, io: Server) {
        return socket.on("sendGroupMessage", async (args) => {
            validationRealTime(sendGroupMessageSocketSchema, args)

            const roomId = await this._chatService.sendGroupMessage(args, socket.data.user)
            const socketIds = await this._redisService.getMembersSocketIoIds(socket.data.user._id)
            io.to(socketIds).emit("successMessage", { ...args, sendTo: args.groupId })

            io.to(roomId).emit("successMessage", {
                content: args.content,
                tags: args.tags,
                attachments: args.attachments,
                from: socket.data.user,
                groupId: args.groupId
            })
        })
    }

    reactMessage(socket: SocketAuthType, io: Server) {
        return socket.on("reactMessage", async (args) => {
            validationRealTime(reactMessageSocketSchema, args)

            const chat = await this._chatService.reactMessage(
                args.chatId,
                args.messageId,
                args.react,
                socket.data.user
            )

            io.to(args.chatId).emit("messageReacted", {
                chatId: args.chatId,
                messageId: args.messageId,
                react: args.react,
                from: socket.data.user,
            })

            if (chat.type == ChatTypeEnum.OVO) {
                for (const participant of chat.participants) {
                    const socketIds = await this._redisService.getMembersSocketIoIds(participant)
                    if (socketIds.length) {
                        io.to(socketIds).emit("messageReacted", {
                            chatId: args.chatId,
                            messageId: args.messageId,
                            react: args.react,
                            from: socket.data.user,
                        })
                    }
                }
            } else {
                io.to(chat.roomId).emit("messageReacted", {
                    chatId: args.chatId,
                    messageId: args.messageId,
                    react: args.react,
                    from: socket.data.user,
                })
            }
        })
    }

    joinRoom(socket: SocketAuthType, io: Server) {
        return socket.on("join_room", async (args) => {
            socket.join(args.roomId)
        })
    }
}

export default new ChatEvnts()
