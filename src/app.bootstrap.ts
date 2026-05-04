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


  app.use("/auth", authController)
  app.use("/user", userController)
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