import type { JwtPayload } from "jsonwebtoken";
import type { IHUser } from "../../DB/Models/user.model.js";



export type ContextType ={user:IHUser,payload:JwtPayload}