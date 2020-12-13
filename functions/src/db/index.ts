import { EventContext } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IEvent, IParticipant } from '../models/events';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';

const AddParticipant = async (eventId: string, participantUID: string, participant: IParticipant) => {
  await admin.database().ref(`/participants/${eventId}/${participantUID}`).set(participant);
  await admin.database().ref(`/${eventId}`).update({ num_participants: admin.database.ServerValue.increment(1) });
};

export const OnEventCreated = (snapshot: DataSnapshot, context: EventContext) => {
  const original: IEvent = snapshot.val();
  const participant: IParticipant = {
    name: original.event_host || original.host,
    rsvp: {
      invited_date: new Date().getTime(),
      attending: true,
    },
  };
  return AddParticipant(context.params.eventId, original.host, participant);
};
