import type { RedisArgument, SetOptions } from "redis";
import type { EmailEnum } from "../../Common/enums/email.enums.js";
import { client } from "./redis.connection.js";
import type {Types } from "mongoose";

class RedisService{
    getBlackListToken({userId,tokenId}:{userId:string|Types.ObjectId,tokenId:string}) {
    return `blackListToken::${userId}::${tokenId}`
}
 getOtpKey({email,emailType}:{email:string,emailType:EmailEnum}) {
    return `OTP::${email}::${emailType}`
}
 getOtpSendNO({email,emailType}:{email:string,emailType:EmailEnum}) {
    return `OTP::${email}::${emailType}::NO`
}
 getOtpBlockedKey({email,emailType}:{email:string,emailType:EmailEnum}) {
    return `OTP::${email}::${emailType}::Blocked`
}

public async  set({key,value,exType="EX",exValue=120}:{key:RedisArgument,value:string|number,exType?: 'EX' | 'PX' | 'EXAT' | 'PXAT',exValue?:number}) {

    return await client.set(key,value,{
        expiration:{type:exType  , value:Math.floor(exValue)
        },
    })
    
}

public async  incr(key:string) {
    return await client.incr(key)
}

public async  decr(key:string) {
    return await client.decr(key)
}


public async  get(key:string) {
    return await client.get(key)
}
public async  Mget(key:string) {
    const keys = Array.isArray(key) ? key : [key];
    return await client.mGet(keys)
}

public async  ttl(key:string) {
    return await client.ttl(key)
}

public async  exists(key:string) {
    return await client.exists(key)
}

public async  persist(key:string) {
    return await client.persist(key)
}

public async  del(keys:string|string[]) {
    return await client.del(keys)
}
public async  update({key,value}:{key:string,value:string|number}) {
    if (!await this.exists(key)){
        return 0;
    }
    await this.set({key, value})
    return 1; 
}
// export async function hset(fields){
//     return await client.hSet(fields)
// }
public async  setExpire(key:string,seconds:number) {
    return await client.expire(key,seconds)  
}
 getFCMKey(userId:Types.ObjectId | string) {
    return `FCM::${userId}`
}
public async addFCMTokensToSet({userId,FCMToken}:{userId:Types.ObjectId | string,FCMToken:string}){
     return await client.sAdd(this.getFCMKey(userId),FCMToken)
}
public async getFCMTokensSetMembers(userId:Types.ObjectId | string){
     return await client.sMembers(this.getFCMKey(userId))
}
}

export default new RedisService()