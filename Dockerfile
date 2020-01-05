FROM node:11-alpine

WORKDIR /app

RUN apk upgrade -U && apk add ffmpeg \
    && rm -rf /var/cache/*

COPY package*.json /app/

RUN npm install

COPY . /app/

CMD npm run --silent start:prod --prefix /app >> /var/log/bot.log
