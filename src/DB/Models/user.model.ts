import { Schema, model, type HydratedDocument } from 'mongoose';
import  { GenderEnum, ProviderEnum, RoleEnum } from '../../Common/enums/enums.user.js';
import { hashOperation } from '../../Common/Security/hash.js';
import { encryptValue } from '../../Common/Security/encryption.js';
import mailService from "../../Common/Email/email.service.js"
import { EmailEnum } from '../../Common/enums/email.enums.js';

// 1. Create an interface representing a document in MongoDB.
export interface IUser { 
    userName: string;
    email: string;
    password: string;
    confrimEmail: boolean;
    phone: string;
    gender: GenderEnum;
    role: RoleEnum;
    age: number;
    provider: ProviderEnum;
    profilePic: string;
    covPic: string[];
    changeCreditTime: Date;
    deletedAt: Date;

}

export type IHUser = HydratedDocument<IUser>;

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: {
        type: String,
        required: function (): boolean {
            return this.provider == ProviderEnum.System
        }
    },
    confrimEmail: { type: Boolean, default: false },
    phone: String,
    gender: { type: Number, enum: GenderEnum, default: GenderEnum.Male },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.User },
    age: Number,
    provider: { type: Number, enum: ProviderEnum, default: ProviderEnum.System },
    profilePic: String,
    covPic: [String],
    changeCreditTime: Date,
    deletedAt:Date

},{
    timestamps:true,
    strictQuery:true
})
userSchema.pre("save",async function(this:IHUser &{wasNew:Boolean}){

    this.wasNew=this.isNew
    
    if(this.isModified("password")) {
    this.password = await hashOperation({ plaintext: this.password })
          }
          
          if (this.phone&&this.isModified("phone")) {
                const phoneEncrypted = encryptValue({ value: this.phone })
                this.phone = phoneEncrypted
            }    
})
userSchema.post("save",async function(this:IHUser &{wasNew:Boolean}){
    
    try{
        if(this.wasNew){
        await mailService.sendEmailOtp({email: this.email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })}
    } catch (error) {
        console.log(error);
        
    }
    
    
})
// userSchema.pre("validate",function (){
//     console.log("pre validate");
    
// })
// userSchema.post("validate",function (){
//     console.log("post validate");

// })
// userSchema.pre("updateOne",{document:true,query:false},function (){
//     console.log("pre updateOne");
//     console.log(this);
    
// })
// userSchema.post("deleteOne",function (){
//     console.log("post validate");

// })
userSchema.pre(["findOne","find"],function (){
    // console.log(this.getQuery());
    const query =this.getQuery()
    if(!query.getSoftDelete){

        this.setQuery({...query,deletedAt:{$exists:false}})
    }
    // else{
    //     this.setQuery({...query})
    // }
    
})
// userSchema.post("deleteOne",function (){
//     console.log("post validate");

// })
// 3. Create a Model.
const UserModel = model<IUser>('User', userSchema);

export default UserModel