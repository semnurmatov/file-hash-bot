import { UploadApiResponse, v2 } from "cloudinary";
import { createHash } from "crypto";
import { imageHash } from "image-hash";
import TelegramBot, { Message } from "node-telegram-bot-api";
import Blockchain from "./blockchain/blockchain";

export default class HashData {


    static hash_value(value: string) {
        return createHash('SHA256').update(value).digest('hex');
    }

    static generateHash(prevHash: string, data: any): string {
        return this.hash_value(`${prevHash}${data.owner}${data.fileUrl}`);
    }

    static fileHash(fileUrl: string, blockchain: Blockchain, bot: TelegramBot, username: string, chatId: number, checkingMes: Message): void {
        imageHash(fileUrl, 16, true, async (err, data)=> {
            if(err) throw err;
            let fileOwner = undefined;

            blockchain.chain.forEach(async (block) => {
                if(block.data.hashFile === data) {
                    fileOwner = block;
                }
            })
            if(fileOwner !== undefined){
                
                await bot.editMessageText(`This file(Image) has an Owner. \nOwner: @${fileOwner.data.owner} \nFile: ${fileOwner.data.fileUrl}\n Date: ${ new Date(fileOwner.timestamp).toLocaleDateString()}.`, {
                chat_id: chatId, message_id: checkingMes.message_id
            })
            }else{
                const uploadingMes = await bot.editMessageText('Uploading...', {
                    chat_id: chatId, message_id: checkingMes.message_id
                });
                const upload: UploadApiResponse = await v2.uploader.upload(fileUrl, { phash: true});
                console.log("Upload: ", upload);
                const newBlock = await blockchain.addBlock({
                    owner: username,
                    fileUrl: upload.url,
                    hashFile: data
                });
                let mesId: number
                if(uploadingMes === false || uploadingMes === true){
                    mesId = checkingMes.message_id;
                }else{
                    mesId = uploadingMes.message_id
                }
                await bot.editMessageText(newBlock.toString(), {
                    chat_id: chatId, message_id: mesId
                });
            }
        });
    }
}