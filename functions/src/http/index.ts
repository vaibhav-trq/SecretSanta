import type * as express from 'express';
import { https, logger } from 'firebase-functions';
import { AddParticipant } from '../db';

export const OnHelloWorld = (request: https.Request, response: express.Response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
};


export const OnJoinEvent = async (data: any, context: https.CallableContext) => {
  const userId = context.auth!.uid;
  // TODO: Validate the user is not already in the event and that the event exists.
  await AddParticipant(data.eventId, null, userId, data.name);
};
