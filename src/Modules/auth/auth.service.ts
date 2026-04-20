import CustomError from "../../Common/exceptions/custom.error.js"
import * as Exceptions from "../../Common/exceptions/domian.exceptions.js"
import { decryptValue, encryptValue } from "../../Common/Security/encryption.js"
import { compareOperation, hashOperation } from "../../Common/Security/hash.js"
import tokenService from "../../Common/Security/token.service.js"
import type { IHUser } from "../../DB/Models/user.model.js"
import UserRepo from "../../DB/Repo/user.repo.js"
import type { confrimEmailDTO, loginDTO, singnUpDTO } from "./auth.dto.js"
import mailService from "../../Common/Email/email.service.js"
import { EmailEnum } from "../../Common/enums/email.enums.js"
import redisService from "../../DB/Redis/redis.service.js"
class AuthService {
    private _userRepo =  UserRepo
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
        bodyData.password = await hashOperation({ plaintext: bodyData.password })
        if (bodyData.phone) {
            const phoneEncrypted = encryptValue({ value: bodyData.phone })
            bodyData.phone = phoneEncrypted
        }

        const [user] = await this._userRepo.create({ data: [bodyData] })

        await this._mailService.sendEmailOtp({ email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })

        return user!;

    }
    async confrimEmail(bodyData:confrimEmailDTO) {
        const { email, otp } = bodyData
        const user = await this._userRepo.findOne({ filter: { email, confrimEmail: false } })

        if (!user) {
            throw new Exceptions.BadRequestException("email already exist")
        }
        const storedOtp = await this._redisMethods.get(this._redisMethods.getOtpKey({ email, emailType: EmailEnum.confrimEmail }))
        if (!storedOtp) {
            throw new Exceptions.BadRequestException("expired Otp" )
        }
        const isOtpValid = await compareOperation({ plaintext: otp, hashedvalue: storedOtp })
        if (!isOtpValid) {
            throw new Exceptions.BadRequestException("otp not valid")
        }
        user.confrimEmail = true,
            await user.save();
    }
    async resendOtpConfrimEmail(email:string) {
        await this._mailService.sendEmailOtp({ email, emailType: EmailEnum.confrimEmail, subject: EmailEnum.confrimEmail })
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
}

export default new AuthService()