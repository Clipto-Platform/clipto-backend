import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TweetV2PostTweetResult, TweetV2SingleResult, TwitterApi, TwitterApiReadOnly, TwitterApiReadWrite, UsersV2Params, UsersV2Result } from 'twitter-api-v2';
import { generateNonce, SiweMessage } from 'siwe';

@Injectable()
export class AppService {
  twitterReadOnlyClient: TwitterApiReadOnly;
  twitterReadWriteClient: TwitterApiReadWrite;

  constructor() {
    this.twitterReadOnlyClient = new TwitterApi(process.env.TWITTER_KEY);
    this.twitterReadWriteClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY || '',
      appSecret: process.env.TWITTER_API_KEY_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
    })
  }

  async verifyTwitter(tweetUrl: string, address: string): Promise<TweetV2SingleResult> {
    const tweetId = tweetUrl.replace(/\/$/, '').split('/').pop();
    const sanitizedTweet = tweetId.split('?')[0];

    const tweetResponse = await this.twitterReadOnlyClient.v2.singleTweet(sanitizedTweet, {
      'tweet.fields': ['author_id', 'lang', 'text', 'created_at'],
      'user.fields': ['name', 'username', 'profile_image_url'],
      expansions: ['author_id'],
    });

    try {
      const isResponse =
        tweetResponse.data.text.indexOf(address) !== -1 &&
        tweetResponse.data.text.toLocaleLowerCase().indexOf('@cliptodao') !== -1;
      if (isResponse) return tweetResponse;

      throw new HttpException('Verificaiton Failure', HttpStatus.BAD_REQUEST);
    } catch (error) {
      throw new HttpException('Verificaiton Failure', HttpStatus.BAD_REQUEST);
    }
  }

  async getUsersTwiterData(users: string[]): Promise<UsersV2Result | string> {
    const fields: Partial<UsersV2Params> = {
      'user.fields': ['id', 'name', 'profile_image_url', 'url', 'username'],
    };

    try {
      const usersData = await this.twitterReadOnlyClient.v2.usersByUsernames(users, fields);
      if (usersData.data.length == 0) {
        throw new HttpException('Twitter profile not found', HttpStatus.BAD_REQUEST);
      }
      return usersData;
    } catch (error) {
      throw new HttpException('Twitter profile not found or something went wrong.', HttpStatus.BAD_REQUEST);
    }
  }

  
  async createTweet(tweetBody:string, message:string, signature:string): Promise <TweetV2PostTweetResult | string> {
    try {
      const isValidToken = await this.validateSignature(message, signature)
      if(isValidToken) return await this.twitterReadWriteClient.v2.tweet(tweetBody)
      else throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED); 
    } catch (error) {
      throw new HttpException('Unable to create tweet', HttpStatus.BAD_REQUEST);
    }
  }

  async generateNonce() {
    return generateNonce();
  }

  async validateSignature(message: string, signature:string) {
    try {
      const siweMessage = new SiweMessage(message);
      await siweMessage.validate(signature)
      return true
    } catch (error) {
      return false
    }
  }
}
