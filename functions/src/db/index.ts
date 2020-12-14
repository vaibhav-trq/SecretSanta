import { EventContext } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IEvent, IParticipant } from '../models/events';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';

export const AddParticipant = async (eventId: string, participantUID: string, participant: IParticipant) => {
  const { commited } = await admin.database().ref(`/participants/${eventId}/${participantUID}`).transaction((curr: IParticipant) => {
    if (curr) {
      return;
    }
    return participant;
  });

  if (commited) {
    await admin.database().ref(`/events/${eventId}`).update({ num_participants: admin.database.ServerValue.increment(1) });
  }
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
