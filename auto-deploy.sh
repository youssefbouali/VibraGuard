#!/bin/bash

cd /home/ubuntu/.VibraGuard/ || exit

git fetch origin main

LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "New changes detected, pulling..."
    git pull origin main

    minikube delete && sh run-all.sh 
fi

#