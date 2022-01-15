import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  private readonly provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.NODE_ENDPOINT);
    const abi = [
      "function creators(address) view returns (address)"
    ]
    this.contract = new ethers.Contract(process.env.CLIPTOEXCHANGE_ADDRESS, abi, this.provider)
  }

  public async validateRequestTx(txHash: string, value: string, creator: string): Promise<boolean> {
    const tx = await this.provider.getTransaction(txHash);
    const txReceipt = await this.provider.getTransactionReceipt(txHash);

    const params = ethers.utils.defaultAbiCoder.decode(['address'], ethers.utils.hexDataSlice(tx.data, 4));

    return txReceipt.status === 1 && tx.value.gte(ethers.utils.parseEther(value)) && creator === params[0];
  }
  /**
   * 
   * @param address address of a potential creator
   * @returns true if address is a creator
   */
  public async checkCreator(address: string): Promise<boolean> {
    const cliptoTokenAddress = await this.contract.creators(address);
    //jonathanng - can someone double check that this code works as intended?
    if (parseInt(cliptoTokenAddress!) === 0) {
      console.log('User is not a registered creator.')
      return false;
    } else {
      return true;
    }
  }
}
