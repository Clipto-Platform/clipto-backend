import { Injectable } from '@nestjs/common';
import { PinataClient } from '@pinata/sdk';
import axios from 'axios';
import { PinAddMetadata } from 'src/dto/Ipfs.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pinata = require('@pinata/sdk');

@Injectable()
export class IPFSService {
  private ipfs: PinataClient;

  constructor() {
    const pinataAPIKey = process.env.PINATA_API_KEY;
    const pinataAPISecret = process.env.PINATA_API_SECRET;

    this.ipfs = pinata(pinataAPIKey, pinataAPISecret);
  }

  private async get(endpoint: string) {
    const response = await axios.get(endpoint);
    return response.data;
  }

  private async pinataGateway(hash: string): Promise<any> {
    const endpoint = `https://gateway.pinata.cloud/ipfs/${hash}`;
    return this.get(endpoint);
  }

  private async ipfsGateway(hash: string): Promise<any> {
    const endpoint = `https://ipfs.io/ipfs/${hash}`;
    return this.get(endpoint);
  }

  public async pin(data: PinAddMetadata): Promise<any> {
    const response = await this.ipfs.pinJSONToIPFS(data.metadata, {
      pinataMetadata: {
        name: data.name,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    });
    return response;
  }

  public async cat(hash: string) {
    try {
      return this.pinataGateway(hash);
    } catch {
      return this.ipfsGateway(hash);
    }
  }
}
