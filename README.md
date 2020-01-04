# Gif_Slowing_Bot
A Reddit bot that slows down gifs when it is invoked, uploads the slowed down version to gfycat and replies the gfycat link back to the invoker. The dockerized version runs the bot script automatically every minute.

## Getting Started

### Prerequisites

- Node.js >= 11

OR

- Docker


### Installing

After cloning the project, navigate to the project root. Create a `.env` file that contains the following information:
```
IMGUR_CLIENT_ID=X
IMGUR_CLIENT_SECRET=X

REDDIT_USERNAME=X
REDDIT_PASSWORD=X
REDDIT_SECRET=X
REDDIT_CLIENT_ID=X
```

Then, in the project root, run
```
npm install
npm run start:dev
```

OR

```bash
./scripts/start.sh
```

OR

```bash
docker build -t gif_slowing_bot .
docker run --env-file .env -v $(pwd)/log:/var/log -d gif_slowing_bot
```
