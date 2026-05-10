import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3"
import { randomUUID } from "node:crypto";
import { ACCESS_KEY_ID, APPLICATION_NAME, BUCKET_NAME, REGION, SECRET_ACCESS_KEY } from "../../config/config.service.js";
import { Upload } from "@aws-sdk/lib-storage";
import { StorageApproachEnum } from "../enums/multer.enums.js";
import { createReadStream } from "node:fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


class S3BucketService {
    private _clinet = new S3Client({
        region: REGION,
        credentials: {
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY
        }
    })
    async uploadFile({ file, path }: { file: Express.Multer.File, path: string }) {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: ObjectCannedACL.private,

        })
        console.log(command);

        await this._clinet.send(command)
        return command.input.Key!
    }
    async createPresignedUploadFile({ originalname,ContentType, path }: { originalname:string,ContentType:string, path: string }) {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${originalname}`,
            // Body: file.buffer,
            ContentType,
            ACL: ObjectCannedACL.private,

        })

        const url = await getSignedUrl(this._clinet, command, { expiresIn: 3600 })
        return { key: command.input.Key!, url }
    }
   

    async uploadLargeFile({ file, path, uploadApproach = StorageApproachEnum.Disk }: { file: Express.Multer.File, path: string, uploadApproach?: StorageApproachEnum }) {
        const command = new Upload({
            client: this._clinet,
            params: {
                Bucket: BUCKET_NAME,
                Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
                Body: uploadApproach == StorageApproachEnum.Memory ? file.buffer : createReadStream(file.path),
                ContentType: file.mimetype
            },
            // partSize:1024*1024*5
        });
        command.on("httpUploadProgress", (progress) => {
            console.log(`file uploading${((progress.loaded as number) / (progress.total as number)) * 100} %`);

        })

        const uploadedFile = await command.done()
        return uploadedFile.Key as string
    }

    async uploadFiles({ files, path, uploadApproach = StorageApproachEnum.Disk }: { files: Express.Multer.File[], path: string, uploadApproach?: StorageApproachEnum }) {


        const Keys = await Promise.all(
            files.map((file) => {
                return uploadApproach == StorageApproachEnum.Memory ?
                    this.uploadFile({ file, path }) :
                    this.uploadLargeFile({ file, path, uploadApproach: StorageApproachEnum.Disk })
            })
        )
        return Keys
    }

    async createPresignedGetFile({Key,filename,download}:{Key:string,filename?:string,download?:string}){
      const command = new GetObjectCommand({
        Bucket:BUCKET_NAME,
        Key,
        ResponseContentDisposition:download=="true"? `attachment; filename=${filename}`:undefined
      })
      return await getSignedUrl(this._clinet, command, { expiresIn: 3600 })
   }
    async getFile(Key:string){
      const command = new GetObjectCommand({
        Bucket:BUCKET_NAME,
        Key
      })
      return await this._clinet.send(command)
   }
   async DeleteFile(Key:string){
    const command = new DeleteObjectCommand({
        Bucket:BUCKET_NAME,
        Key
    })
   return await this._clinet.send(command)
   }
   async DeleteFiles(Keys:{Key:string}[]){
    const command = new DeleteObjectsCommand({
        Bucket:BUCKET_NAME,
        Delete:{Objects:Keys}
    })
   return await this._clinet.send(command)
   }

   async listFoldersKeys(Prefix:string){
    const command = new ListObjectsV2Command({
        Bucket:BUCKET_NAME,
        Prefix:`${APPLICATION_NAME}/${Prefix}`
    })
    return await this._clinet.send(command)
   }
}


export default new S3BucketService()