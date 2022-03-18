import HashData from "./hash";
import { v2 } from 'cloudinary';
import TelegramBot from "node-telegram-bot-api";
import Blockchain from "./blockchain/blockchain";

require('dotenv').config();

const port = process.env.PORT || 5000;

const blockchain: Blockchain = new Blockchain();

v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});


const bot = new TelegramBot(process.env.HASH_FILES_BOT, { polling: true});
bot.on('message', async (mes, metadata?) => {
    const chatId = mes.chat.id;

    if(mes.text === '/validate'){
        const validate = 'Validating...';

        const sendMes = await bot.sendMessage(chatId, validate);

        const isValid: boolean = await blockchain.isValidChain(blockchain.chain);
        bot.editMessageText(`${isValid ? 'The chain is Valid.' : 'The chain is invalid.' }`, { chat_id: chatId, message_id: sendMes.message_id})

    }else{
        if(metadata.type !== 'text'){
            const type = metadata.type;
            let fileId;
            let username = mes.from.username;
     
            switch (type) {
                case 'photo':
                    fileId = mes.photo[mes.photo.length-1].file_id;
                    username = mes.from.username;
                    break;
                case 'document':
                    fileId = mes.document.file_id;
                    username = mes.from.username;
                    break;
            }
            const checkingMes = await bot.sendMessage(chatId, "Checking...");
            const filePath = await bot.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${process.env.HASH_FILES_BOT}/`+ filePath.file_path;
    
            HashData.fileHash(fileUrl, blockchain, bot, username, chatId, checkingMes);
            
    
        }else{
            const hashText = HashData.hash_value(mes.text)
            const obj = {
                origin: mes.text,
                hashed: hashText
            }
            await bot.sendMessage(chatId, `Origin: ${obj.origin} \nHashed Data: ${obj.hashed}`);
        }
    }

});   

