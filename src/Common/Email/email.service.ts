
import redisService from "../../DB/Redis/redis.service.js"
import { EmailEnum } from "../enums/email.enums.js"
import { hashOperation } from "../Security/hash.js"
import { sendEmail } from "./send.email.js"
import {createOtp} from "./otp.service.js"
import { temblateEmail } from "./email.temblate.js"
import { BadRequestException } from "../exceptions/domian.exceptions.js"



class MailService {
   private _redisMethods = redisService
    
   constructor(){}

    async sendEmailOtp({ email, emailType, subject }:{email:string,emailType:EmailEnum, subject:string}) {

        const prevOtp = await this._redisMethods.ttl(this._redisMethods.getOtpKey({ email, emailType }))
        if (prevOtp > 0) {
            throw new BadRequestException(`There is already OTP expire after ${prevOtp} s`)
        }

        const isBloked = await this._redisMethods.exists(this._redisMethods.getOtpBlockedKey({ email, emailType }))

        if (isBloked) {

            const blockTime = await this._redisMethods.ttl(this._redisMethods.getOtpBlockedKey({ email, emailType })) / 60

            throw new BadRequestException(`you have ablock you can send after ${Math.floor(blockTime)} M`);
        }

        const reqNo = await this._redisMethods.get(this._redisMethods.getOtpSendNO({ email, emailType }))

        if (Number(reqNo) == 5) {
            await this._redisMethods.set({
                key: this._redisMethods.getOtpBlockedKey({ email, emailType }),
                value: 1
                , exValue: 600
            })

            throw new BadRequestException("yon dont send more request 5 email in 20 min  ");

        }

        const otp= createOtp()

        await sendEmail({ to: email, subject: EmailEnum.confrimEmail, html: temblateEmail(otp)  })


        await this._redisMethods.set({
            key: this._redisMethods.getOtpKey({ email, emailType }),
            value: await hashOperation({ plaintext: String(otp) }), exValue: 300
        })
        await this._redisMethods.incr(this._redisMethods.getOtpSendNO({ email, emailType }))

    }
}

export default new MailService()