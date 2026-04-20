import { compare, hash } from "bcrypt";
import { SALT_ROUNDS } from "../../config/config.service.js";

export async function hashOperation({plaintext , round = SALT_ROUNDS}:{plaintext:string,round?:number}) {

   return await hash( plaintext , round )
    
}
export async function compareOperation({plaintext,hashedvalue}:{plaintext:string,hashedvalue:string}) {

    return await compare(plaintext,hashedvalue)
    
}