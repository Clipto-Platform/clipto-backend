import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TweetV2SingleResult, TwitterApi, TwitterApiReadOnly, UsersV2Params, UsersV2Result } from 'twitter-api-v2';

@Injectable()
export class AppService {
  twitterClient: TwitterApiReadOnly;

  constructor() {
    this.twitterClient = new TwitterApi(process.env.TWITTER_KEY).readOnly;
  }

  async verifyTwitter(tweetUrl: string, address: string): Promise<TweetV2SingleResult> {
    const tweetId = tweetUrl.replace(/\/$/, '').split('/').pop();
    const sanitizedTweet = tweetId.split('?')[0];

    const tweetResponse = await this.twitterClient.v2.singleTweet(sanitizedTweet, {
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
      const usersData = await this.twitterClient.v2.usersByUsernames(users, fields);
      if (usersData.data.length == 0) {
        throw new HttpException('Twitter profile not found', HttpStatus.BAD_REQUEST);
      }
      return usersData;
    } catch (error) {
      throw new HttpException('Twitter profile not found or something went wrong.', HttpStatus.BAD_REQUEST);
    }
  }
}
