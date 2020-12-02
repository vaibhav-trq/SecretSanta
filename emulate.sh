#!/bin/bash

# Exit on error.
set -e

# Build host.
npm --prefix public run lint
npm --prefix public run build

# Build functions.
npm --prefix functions run lint
npm --prefix functions run build

# Start emulator.
firebase emulators:start
