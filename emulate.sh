#!/bin/bash

# Exit on error.
set -e

# Build host.
npm --prefix public run lint
npm --prefix public run build

# Build functions.
npm --prefix functions run lint
npm --prefix functions run build

# Start emulator.-
GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/google_creds.json
FIREBASE_DATABASE_EMULATOR_HOST="localhost:9000"
firebase emulators:start --only hosting,database,functions,auth --import=./data --export-on-exit
