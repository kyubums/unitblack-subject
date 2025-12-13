#!/bin/bash

if [ ! -f "package.json" ]; then
  echo "Please run this script from the project root."
  exit 1
fi

COMMAND=$1
MIGRATION_NAME=$2

if [ -z "$COMMAND" ]; then
  echo "Usage: $0 <show|run|revert|generate> [migration-name]"
  exit 1
fi

case $COMMAND in
  show|run|revert)
    yarn typeorm-ts-node-commonjs migration:$COMMAND -d ./src/database/database.config.ts
    ;;
  generate)
    if [ -z "$MIGRATION_NAME" ]; then
      echo "Error: migration name is required for generate command"
      echo "Usage: $0 generate <migration-name>"
      exit 1
    fi
    yarn typeorm-ts-node-commonjs migration:generate -d ./src/database/database.config.ts ./src/database/migrations/$MIGRATION_NAME
    ;;
  *)
    echo "Error: Invalid command '$COMMAND'"
    echo "Usage: $0 <show|run|revert|generate> [migration-name]"
    exit 1
    ;;
esac
