import * as firebase from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OnUserCreated, OnUserDeleted } from './auth';
import { OnHelloWorld } from './http';
import { OnEventCreated } from './db';
admin.initializeApp(firebase.config().firebase);

// Auth handlers.
export const createUser = firebase.auth.user().onCreate(OnUserCreated);
export const deleteUser = firebase.auth.user().onDelete(OnUserDeleted)

// DB Handlers.
export const createEvent = firebase.database.ref('/events/{eventId}').onCreate(OnEventCreated);

// HTTP Handlers.
export const helloWorld = firebase.https.onRequest(OnHelloWorld);
