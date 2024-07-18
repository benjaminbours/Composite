#!/bin/sh

# Start Redis server
redis-server &

# Start your application
npm run start:prod