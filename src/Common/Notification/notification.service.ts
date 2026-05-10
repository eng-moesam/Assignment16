import admin from "firebase-admin"
import { readFileSync } from "node:fs";
import path from "node:path";

class  NotificationService{

    
 private _clinet:admin.app.App

constructor(){
 const _serviceAccount = JSON.parse(readFileSync(path.resolve("./social-media-online-c6a9a-firebase-adminsdk-fbsvc-7c772608dc.json"))as unknown as string)

this._clinet= admin.initializeApp({
  credential: admin.credential.cert(_serviceAccount)
});
}


async sendNotification({token,data}:{token:string,data:{title:string,body:string}}){
  return await  this._clinet.messaging().send({token,data})
}
async sendNotifications({tokens,data}:{tokens:string[],data:{title:string,body:string}}){
return await Promise.all(tokens.map((token)=>{
    return this.sendNotification({token,data})
}))
}
}

export default new NotificationService()
