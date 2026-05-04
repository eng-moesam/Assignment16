import CustomError from "../../Common/exceptions/custom.error.js"
import * as Exceptions from "../../Common/exceptions/domian.exceptions.js"
import { decryptValue, encryptValue } from "../../Common/Security/encryption.js"
import { compareOperation, hashOperation } from "../../Common/Security/hash.js"
import tokenService from "../../Common/Security/token.service.js"
import type { IHUser } from "../../DB/Models/user.model.js"
import UserRepo from "../../DB/Repo/user.repo.js"
import type { confrimEmailDTO, loginDTO, resetPasswordDTO, singnUpDTO, verfiyOtpForgetPasswordDTO } from "./auth.dto.js"
import mailService from "../../Common/Email/email.service.js"
import { EmailEnum } from "../../Common/enums/email.enums.js"
import redisService from "../../DB/Redis/redis.service.js"
import { OAuth2Client } from "google-auth-library"
import { WEB_CLIENT_ID } from "../../config/config.service.js"
import { ProviderEnum } from "../../Common/enums/enums.user.js"



class AuthService {
    private _userRepo = UserRepo
    private _tokenService = tokenService
    private _mailService = mailService
    private _redisMethods = redisService
    constructor() { }


    public async signUp(bodyData: singnUpDTO): Promise<IHUser> {
        const { email } = bodyData
        const isEmail = await this._userRepo.findOne({ filter: { email } })
        if (isEmail) {
            throw new Exceptions.ConflictException("email is already exist")
        }
        // bodyData.password = await hashOperation({ plaintext: bodyData.password })
        // if (bodyData.phone) {
        //     const phoneEncrypted = encryptValue({ value: bodyData.phone })
        //     bodyData.phone = phoneEncrypted
        // }

        const [user] = await this._userRepo.create({ data: [bodyData] })

        // await this._mailService.sendEmailOtp({ email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })

        return user!;

    }
    async confrimEmail(bodyData: confrimEmailDTO) {
        const { email, otp } = bodyData
        const user = await this._userRepo.findOne({ filter: { email, confrimEmail: false } })

        if (!user) {
            throw new Exceptions.BadRequestException("email already exist")
        }
        const storedOtp = await this._redisMethods.get(this._redisMethods.getOtpKey({ email, emailType: EmailEnum.confrimEmail }))
        if (!storedOtp) {
            throw new Exceptions.BadRequestException("expired Otp")
        }
        const isOtpValid = await compareOperation({ plaintext: otp, hashedvalue: storedOtp })
        if (!isOtpValid) {
            throw new Exceptions.BadRequestException("otp not valid")
        }
        user.confrimEmail = true,
            await user.save();
    }
    async resendOtpConfrimEmail(email: string) {
        await this._mailService.sendEmailOtp({ email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })
    }


    async resendForgetPasswordOtp(email: string) {
        await this._mailService.sendEmailOtp({ email, emailType: EmailEnum.forgetPassword, subject: EmailEnum.forgetPassword })
    }
    async sendOTPforgetPassword(email: string) {
        const user = await this._userRepo.findOne({ filter: { email } })
        if (!user) {
            return;
        }
        if (!user.confrimEmail) {
            throw new Exceptions.BadRequestException("confrim your email frist");

        }
        await this._mailService.sendEmailOtp(
            { email, emailType: EmailEnum.forgetPassword, subject: EmailEnum.forgetPassword })
    }

    async verfiyOTPforgetPassword(bodyData: verfiyOtpForgetPasswordDTO) {

        const { email, otp } = bodyData

        const emailOtp = await this._redisMethods.get(
            this._redisMethods.getOtpKey({
                email,
                emailType: EmailEnum.forgetPassword
            })
        )
        if (!emailOtp) {

            throw new Exceptions.BadRequestException("otp Expired");


        }
        const storedOtp = await this._redisMethods.get(this._redisMethods.getOtpKey({ email, emailType: EmailEnum.forgetPassword }))
        if (!storedOtp) {
            throw new Exceptions.BadRequestException("expired Otp")
        }
        const isOtpValid = await compareOperation({
            plaintext: otp,
            hashedvalue: storedOtp
        })
        if (!isOtpValid) {
            throw new Exceptions.BadRequestException("otp not valid")
        }


    }
    async resetPassword(bodyData: resetPasswordDTO) {
        const { email, password, otp } = bodyData
        await this.verfiyOTPforgetPassword({ email, otp })

        await this._userRepo.updateOne({
            filter: { email },
            data: { password: await hashOperation({ plaintext: password }) }
        })

    }


    public async login(bodyData: loginDTO) {

        const { email, password } = bodyData
        const user = await this._userRepo.findOne({ filter: { email } })

        if (!user) {
            throw new Exceptions.NotFoundException("no found user")

        }
        const ispassword = await compareOperation({ plaintext: password, hashedvalue: user.password })

        if (!ispassword) {
            throw new Exceptions.NotFoundException("invalid info")
        }
        if (user.phone) {
            user.phone = decryptValue({ value: user.phone })
        }


        const { acsses_token, refresh_token } = this._tokenService.genratesignToken(user);
        return { acsses_token, refresh_token }


    }


    async verfiyGoogleTokenId(tokenId:string) {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: WEB_CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // This ID is unique to each Google Account, making it suitable for use as a primary key
        // during account lookup. Email is not a good choice because it can be changed by the user.
        // const userid = payload['sub'];
        // If the request specified a Google Workspace domain:
        // const domain = payload['hd'];
        return payload
    }

    async loginWithGmail(idToken:string):Promise<{
     acsses_token:string;
      refresh_token:string}> {

        const payloadToken = await this.verfiyGoogleTokenId(idToken)
        if(!payloadToken){
         throw new Exceptions.BadRequestException("invalid tokemn payload")   
        }
        if (!payloadToken.email_verified) {
            throw new Exceptions.BadRequestException("email not varfied")
        }

        const user = await this._userRepo.findOne({  filter: { email: payloadToken.email as string, provider: ProviderEnum.Google } })

        if (!user) {

            return this.signupWithGmail( idToken )


        }

        const { acsses_token, refresh_token } =this._tokenService.genratesignToken(user)

        return{ acsses_token, refresh_token }

    }

    async signupWithGmail(idToken:string):Promise<{
     acsses_token:string;
      refresh_token:string}> {


        const payloadGoogleToken = await this.verfiyGoogleTokenId(idToken)
        if(!payloadGoogleToken){
         throw new Exceptions.BadRequestException("invalid tokemn payload")   
        }


        if (!payloadGoogleToken.email_verified) {
            throw new Exceptions.BadRequestException("email not varfied")
        }

        const user = await this._userRepo.findOne({  filter: { email: payloadGoogleToken.email as string} })

        if (user) {
            if (user.provider == ProviderEnum.System) {
                throw new Exceptions.BadRequestException(" acount already exsit sign up with password and email")
            }
            return  await this.loginWithGmail(idToken) //login with google
        }

        const [newUser] = await this._userRepo.create({
           data: [{
                email: payloadGoogleToken.email,
                userName: payloadGoogleToken.name,
                profilePicture: payloadGoogleToken.picture,
                confrimEmail: true,
                provider: ProviderEnum.Google
            }]
        })
        const { acsses_token, refresh_token } = this._tokenService.genratesignToken(newUser!)



        return {  acsses_token, refresh_token  }



    }

}

export default new AuthService()