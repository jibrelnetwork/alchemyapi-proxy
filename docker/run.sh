#!/bin/sh -e

RUNMODE="${1:-start}"
ENVIRONMENT="${ENV:-undefined}"

if [ "${RUNMODE}" = "start" ]; then
  echo "Starting alchemyapi-proxy service, version: `cat /app/version.txt` on node `hostname`"

  dockerize -timeout 1m -wait tcp://`echo $REDIS_HOST:$REDIS_PORT`

  echo "Ready"

  npm start

else
  echo "Unknown command"
fi
