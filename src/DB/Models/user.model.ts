import { Schema, model, type HydratedDocument } from 'mongoose';
import  { GenderEnum, ProviderEnum, RoleEnum } from '../../Common/enums/enums.user.js';

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
    changeCreditTime: Date

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
    changeCreditTime: Date

})

// 3. Create a Model.
const UserModel = model<IUser>('User', userSchema);

export default UserModel