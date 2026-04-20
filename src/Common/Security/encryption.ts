import CryptoJS from "crypto-js";
import { ENCRPTION_KEY } from "../../config/config.service.js";
export function encryptValue({ value, encrotionKey = ENCRPTION_KEY }: { value: string, encrotionKey?: string }) {
            return CryptoJS.AES.encrypt(value, encrotionKey).toString();
     
}
export function decryptValue({ value, encrotionKey = ENCRPTION_KEY }: { value: string, encrotionKey?: string }) {
     const bytes = CryptoJS.AES.decrypt(value, encrotionKey);
     const originalText = bytes.toString(CryptoJS.enc.Utf8);
     return originalText

}