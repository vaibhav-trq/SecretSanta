import type * as express from 'express';
import { https, logger } from 'firebase-functions';

export const OnHelloWorld = (request: https.Request, response: express.Response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
};
