import { Server, type ExtendedError } from "socket.io"
import {Server as httpServer} from "http"
import tokenService from "../../Common/Security/token.service.js"
import type { SocketAuthType } from "../../Common/Interfaces/express.interface.js"
import z from "zod"
import { validationRealTime } from "../../Middlewares/valdation.middleware.js"
import chatEvents from "../chat/realtime/chat.event.js"
import chatGateway from "../chat/realtime/chat.gateway.js"
import redisService from "../../DB/Redis/redis.service.js"





class RealtimeGateway{

   private _tokenService = tokenService
   private _chatGateway    = chatGateway
   private _redisServise =redisService
   authentication =  async (socket:SocketAuthType, next:(err?: ExtendedError) => void) => {
    try {
      const { user, verfiy } = await this._tokenService.checkTokenCode(
        socket.handshake.auth.authorization

      )
      socket.data= { user, verfiy }

     await this._redisServise.addSocketIoToSet({userId:user._id,SocketId:socket.id})
      next()
    } catch (error) {
      // socket.emit("connection_error",error)
      next(error as ExtendedError)
    }
  }
   
    initializeIO(server :httpServer){
  

         const io = new Server(server, { cors: { origin: "*" } })
  io.use(this.authentication)
  io.on("connection", async (socket:SocketAuthType) => {
 
   this._chatGateway.registerEvents(socket,io)


    socket.on("disconnect", async ()=>{
    await this._redisServise.removeSocketId({userId:socket.data.user._id,SocketId:socket.id})
  })
  })

 
    }
}


export default new RealtimeGateway()