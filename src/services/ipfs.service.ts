import { Injectable } from '@nestjs/common';
import { PinataClient } from '@pinata/sdk';
import { CID, create, IPFSHTTPClient } from 'ipfs-http-client';
import { PinAddMetadata } from 'src/dto/Ipfs.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pinata = require('@pinata/sdk');

@Injectable()
export class IPFSService {
  private ipfs: PinataClient;
  private graph: IPFSHTTPClient;

  constructor() {
    const pinataAPIKey = process.env.PINATA_API_KEY;
    const pinataAPISecret = process.env.PINATA_API_SECRET;

    this.ipfs = pinata(pinataAPIKey, pinataAPISecret);
    this.graph = create({
      url: 'https://api.thegraph.com/ipfs/api/v0',
    });
  }

  private async pinToGraph(hash: string) {
    try {
      await this.graph.pin.add(CID.parse(hash));
    } catch (e) {
      console.log(`failed to pin hash to graph node hash: ${hash}`);
    }
  }

  public async pin(data: PinAddMetadata): Promise<any> {
    const response = await this.ipfs.pinJSONToIPFS(data.metadata, {
      pinataMetadata: {
        name: data.name,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    });

    // pin the new hash on graph for subgraph indexing
    this.pinToGraph(response.IpfsHash);

    return response;
  }
}
