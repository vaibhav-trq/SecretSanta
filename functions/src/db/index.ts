import { Change, EventContext, logger } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';
import { DbRoot } from './db';

const AddParticipant = async (eventId: string, hostId: string, userId: string, userName: string) => {
  const participant: SecretSanta.IParticipant = {
    name: userName,
    rsvp: {
      invited_date: new Date().getTime(),
      attending: true,
    },
  };
  const userRsvp: SecretSanta.IUserRsvp = {
    attending: true,
    host: (userId === hostId),
  };
  const eventQuery = DbRoot.child('events').child(eventId);
  await eventQuery.child('rsvps').child(userId).set(participant);
  await DbRoot.child('users').child(userId).child('events').child(eventId).set(userRsvp);
  // TODO: Current QueryBuilder doesn't support ServerValue.increment
  return eventQuery.child('metadata').ref.update({ num_participants: admin.database.ServerValue.increment(1) });
};

export const OnEventCreated = (snapshot: DataSnapshot, context: EventContext) => {
  const event: SecretSanta.IEvent = snapshot.val();
  const metadata = event.metadata;
  return AddParticipant(context.params.eventId, metadata.host, metadata.host, metadata.event_host || metadata.host);
};

export const OnUserRsvpChange = (change: Change<DataSnapshot>, context: EventContext) => {
  logger.debug("Called!", context.params);
  const uid: string = context.params.userId;
  const eid: string = context.params.eventId;
  const event: SecretSanta.IUserRsvp = change.after.val();
  return DbRoot.child('events').child(eid).child('rsvps').child(uid).child('rsvp').child('attending').set(event.attending);
};
