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
firebase emulators:start --only hosting,database,functions,auth --import=./data --export-on-exit &
EMULATOR_PID=$!

# Start watchers in the background
npm --prefix public run watch_ts &
HOSTING_TS_PID=$!

npm --prefix public run watch_pug &
HOSTING_PUG_PID=$!

read  -n 1 -p "Press Enter to Stop:" mainmenuinput

trap 'kill $(jobs -p) && wait && echo Successfully exited' SIGINT SIGTERM EXIT
