import type * as express from 'express';
import { https, logger } from 'firebase-functions';
import { AddParticipant } from '../db';
import { IParticipant } from '../models/events';

export const OnHelloWorld = (request: https.Request, response: express.Response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
};


export const OnJoinEvent = async (data: any, context: https.CallableContext) => {
  const userId = context.auth!.uid;
  const participant: IParticipant = {
    name: data.name,
    rsvp: {
      attending: true,
      invited_date: new Date().getTime(),
    },
  };
  await AddParticipant(data.eventId, userId, participant);
};
