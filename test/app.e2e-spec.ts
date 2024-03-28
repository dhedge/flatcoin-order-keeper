import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Prometheus Controller (e2e)', () => {
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

  it('/metrics (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/metrics').expect(200);

    const responseBody = response.text;
    const expectedString = 'process_cpu_user_seconds_total';
    expect(responseBody).toContain(expectedString);
  });
});
