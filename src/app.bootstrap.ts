import express from "express"
import authController from "./Modules/auth/auth.controller.js"
import globalErrHandling from "./Middlewares/globalErr.midlleware.js"
import { PORT } from "./config/config.service.js"
import DBconnection from "./DB/connection.js"
import { testRedisConnection } from "./DB/Redis/redis.connection.js"
import userController from "./Modules/user/user.controller.js"
import cors from "cors"
import UserModel, { type IHUser } from "./DB/Models/user.model.js"
import S3BucketService from "./Common/S3Bucket/s3bucket.config.js"
import { pipeline } from "node:stream"
import { promisify } from "node:util"
import successResponse from "./Common/Response/success.response.js"
import postController from "./Modules/post/post.controller.js"
import storyController from "./Modules/story/story.controller.js"
import commentController from "./Modules/comment/comment.controller.js"
import { createHandler } from "graphql-http/lib/use/express"
import schema from "./Modules/gql/schema.gql.js"
import { auth } from "./Middlewares/authentication.middleware.js"

async function bootstrap() {

  
  const app: express.Express = express()
  app.use(express.json())
  app.use(cors())

  await DBconnection()
  await testRedisConnection()

  app.get("/", (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction): void => {

    res.status(200).json({ msg: "landing page" })
  })

  // const [user] =await UserModel.create([{
  // userName:"user Name" ,
  // email: "moesam22@gmail.com",
  // password: "Saraha12*",
  // // confrimPassword: "Saraha12*",
  // phone: "01000100100",
  // gender:0
  // }]);

  //  const user = await UserModel.findOne({
  //   email:"moesam224466@gmail.com",
  //   // getSoftDelete:false
  //  })

  //  console.log({user}); 

  // user?.updateOne({userName:"updateName"})
  // // (await user).userName="hhhhh"
  // // // ;(await user).password="00000000"
  // // ;(await user).save()
  //  if(!user){
  //   return;
  //  }
  //  await UserModel.updateOne({
  //   _id:user._id
  //  },{
  //   userName:"updated"
  //  })
  app.all("/graphql",auth(),createHandler({ schema ,context:(req)=>({user:req.raw.user,payload:req.raw.payload})}))


  app.use("/auth", authController)
  app.use("/user", userController)
  app.use("/post", postController)
   app.use("/comment", commentController)

  app.use("/story", storyController)
  app.use("/uploads/*path", async (req, res, next) => {
    const {path}= req.params
    const {filename,download} =req.query
    const Key = path.join("/")
    const result = await S3BucketService.getFile( Key )
    const pipleLineStreamRead = promisify(pipeline)
    if(download == "true"){
       res.setHeader("content-disposition",`attachment; filename=${filename  || path[path.length-1]}`)
    }
    await pipleLineStreamRead(result.Body as NodeJS.ReadableStream, res)
  })
  app.use("/pre-signed-upload/*path", async (req, res, next) => {
    const {path}= req.params
    const {filename,download} =req.query
    const Key = path.join("/")
    const result = await S3BucketService.createPresignedGetFile({ Key,filename:filename as string || (path[path.length-1]  )as string,download:download as string} )
    return successResponse({res,msg:"data",data:result})
    // const pipleLineStreamRead = promisify(pipeline)
    // if(download == "true"){
    //    res.setHeader("content-disposition",`attachment; filename=${filename  || path[path.length-1]}`)
    // }
    // await pipleLineStreamRead(result.Body as NodeJS.ReadableStream, res)
  })
  // app.use("/send-notfication", async (req, res, next) => {
  //   console.log({body:req.body});
  //     return res.status(200).json({req:req.body})
      
  // })
  app.use("/*dummy", (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction): void => {

    res.status(404).json({ msg: "invalid:url" })
  })
  app.use(globalErrHandling)
  app.listen(PORT, () => {
    console.log("app listen on port 3000");
  })
}

export default bootstrap