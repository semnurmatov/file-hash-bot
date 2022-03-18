import HashData from "../hash";
import Block from "./block";
import { FileData } from "./types";

export default class Blockchain {
    chain: Block[];

    constructor() {
        this.chain = [Block.getGenesisBlock()];
    }

    async addBlock(data: FileData): Promise<Block> {
        const newBlock = Block.newBlock(this.chain[this.chain.length-1], data);
        this.chain.push(newBlock);
        return newBlock;
    }

    async isValidChain(blocks: Block[]): Promise<boolean> {
        if(JSON.stringify(blocks[0]) !== JSON.stringify(Block.getGenesisBlock())){
            return false;
        }

        let i = 1;
        blocks.forEach((block)=> {
            const prev: Block = block;
            const current: Block = blocks[i];

            if(prev.hash !== current.prevBlockHash || current.hash !== HashData.generateHash(current.prevBlockHash, current.data)){
                return false;
            }
            i++;
        });
        
        return true;
    }
}