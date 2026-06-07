import type { Server } from "socket.io"
import type { SocketAuthType } from "../../../Common/Interfaces/express.interface.js"
import chatEvent from "./chat.event.js"


class ChatGateway{
    private _chatEvent = chatEvent
   
    registerEvents(socket : SocketAuthType,io:Server){
       this._chatEvent.getChatEvent(socket)
       this._chatEvent.sendMessage(socket,io)
       this._chatEvent.sendGroupMessage(socket,io)
       this._chatEvent.reactMessage(socket,io)
       this._chatEvent.joinRoom(socket,io)
    }
}
export default new ChatGateway()