#!/bin/bash
while true; do
  ps -ef | grep "npm run lint" | grep -v grep
  if [ $? -ne 0 ]; then
    echo "Lint finished"
    break
  fi
  sleep 1
done
