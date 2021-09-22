# BlewBot

BlewBot is a Discord bot. Use it to keep track of activity in voice channels.

## Requirements

- [Node.js](https://nodejs.org/en/) with [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Usage

- `npm install`
- `npm init`
- Create a file called `.env` and add [your token](https://discord.com/developers) and prefix to it.

.env

```.env
TOKEN=YOURTOKEN
PREFIX=!
DASHBOARD_URL=https://dashboard.yourdomain.com
```

### Start

- Developing: `nodemon index.js`
- Production: `node index.js`
