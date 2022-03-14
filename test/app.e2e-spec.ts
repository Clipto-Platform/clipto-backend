import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

const getSampleTwitter = () => {
  return {
    tweetUrl: 'https://twitter.com/gabrielhaines/status/1502361422277263364',
    address: '0xCFFE08BDf20918007f8Ab268C32f8756494fC8D8',
  };
};

describe('AppController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should verify user via twitter', (done) => {
    request(app.getHttpServer())
      .post('/user/verify')
      .send(getSampleTwitter())
      .expect(201)
      .then((response) => {
        assert(typeof response.body.data, 'object');
        done();
      })
      .catch((err) => done(err));
  });

  it('should handle invalid verification via twitter', () => {
    return request(app.getHttpServer())
      .post('/user/verify')
      .send({
        ...getSampleTwitter(),
        address: 'kkjdskjds',
      })
      .expect(400);
  });
});
