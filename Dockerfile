FROM node:11-alpine

WORKDIR /app

COPY ./scripts/crontab.txt /app
COPY ./scripts /app/scripts

RUN apk upgrade -U && apk add ffmpeg \
    && /usr/bin/crontab ./crontab.txt \
    && rm -rf /var/cache/*

COPY package*.json /app/

RUN npm install

COPY . /app/

RUN chmod 755 ./scripts/docker-entry.sh

CMD ./scripts/docker-entry.sh
