import * as firebase from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(firebase.config().firebase);

import { OnUserCreated, OnUserDeleted } from './auth';
import { OnHelloWorld, OnJoinEvent } from './http';
import { OnEventCreated, OnUserRsvpChange } from './db';

// Auth handlers.
export const createUser = firebase.auth.user().onCreate(OnUserCreated);
export const deleteUser = firebase.auth.user().onDelete(OnUserDeleted)

// DB Handlers.
export const createEvent = firebase.database.ref('/events/{eventId}').onCreate(OnEventCreated);
export const updatedUserRSVP = firebase.database.ref('/users/{userId}/events/{eventId}').onUpdate(OnUserRsvpChange);

// HTTP Handlers.
export const helloWorld = firebase.https.onRequest(OnHelloWorld);
export const joinEvent = firebase.https.onCall(OnJoinEvent);
