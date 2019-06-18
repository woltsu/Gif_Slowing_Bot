#!/bin/sh

# Stop previous container
docker stop $(docker ps -q --filter ancestor=gif_slowing_bot )

# Clear output folder
rm -rf ./output

# Pull latest version from GitHub (TODO)

# Build image
docker build -t gif_slowing_bot .

# Run container
docker run --env-file .env -v $(pwd)/log:/var/log -d gif_slowing_bot