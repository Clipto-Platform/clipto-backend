import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  private readonly ethers: ethers.providers.JsonRpcProvider;

  constructor() {
    this.ethers = new ethers.providers.JsonRpcProvider(process.env.NODE_ENDPOINT);
  }

  public async validateRequestTx(txHash: string, value: string, creator: string): Promise<boolean> {
    const tx = await this.ethers.getTransaction(txHash);
    const txReceipt = await this.ethers.getTransactionReceipt(txHash);

    const params = ethers.utils.defaultAbiCoder.decode(['address'], ethers.utils.hexDataSlice(tx.data, 4));

    return txReceipt.status === 1 && tx.value.gte(ethers.utils.parseEther(value)) && creator === params[0];
  }
}
