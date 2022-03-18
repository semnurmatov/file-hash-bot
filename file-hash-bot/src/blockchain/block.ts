import HashData from "../hash";
import { FileData } from "./types";

export default class Block {
    timestamp: number;
    prevBlockHash: string;
    data: FileData;
    hash: string;

    constructor(timestamp: number,  prevBlockHash: string,  hash: string, data: FileData){
        this.timestamp = timestamp;
        this.prevBlockHash = prevBlockHash;
        this.hash = hash;
        this.data = data;
    }

    static getGenesisBlock() : Block {
        return new Block(0, 'prev-hash', 'current-hash', { fileUrl: 'url-data', hashFile: 'hash-file', owner:  'Block' });
    }

    static newBlock(prevBlock: Block, data: FileData): Block {
        let timestamp: number;
        const prevHash: string = prevBlock.hash;
        timestamp = Date.now();
        const hashData = HashData.generateHash(prevHash, data);
        return new this(timestamp, prevHash, hashData, data);
    }

    toString(): string {
        return `Block:
Timestamp: ${new Date(this.timestamp).toLocaleDateString()}
Previous Hash: ${this.prevBlockHash}
Hash: ${this.hash}
Owner: @${this.data.owner}
File: ${this.data.fileUrl}
HashFile: ${this.data.hashFile}`
    }
    
}