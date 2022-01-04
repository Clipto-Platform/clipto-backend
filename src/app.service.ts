import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TweetV2SingleResult, TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';

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

    if (
      tweetResponse.data.text.indexOf(address) !== -1 &&
      tweetResponse.data.text.toLocaleLowerCase().indexOf('@cliptodao') !== -1
    ) {
      return tweetResponse;
    }
    throw new HttpException('Verificaiton Failure', HttpStatus.BAD_REQUEST);
  }
}
