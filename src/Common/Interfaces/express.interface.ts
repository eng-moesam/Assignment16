import type { JwtPayload } from "jsonwebtoken";
import type { IHUser } from "../../DB/Models/user.model.js";
import type { Socket } from "socket.io";

declare module "express-serve-static-core"{
     interface Request {
        user:IHUser
        payload:JwtPayload
     }
}



export interface SocketAuthType extends Socket{
   data:{user:IHUser,verfiy:JwtPayload}
}