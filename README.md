# BlewBot

BlewBot is a Discord bot. Use it to keep track of activity in voice channels.

## Requirements

- [Node.js](https://nodejs.org/en/) with [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Usage

- `npm install`

### .env

- Create a file called `.env` and add [your token](https://discord.com/developers) and prefix to it.
- Generate an access token secret using [Djecrety](https://djecrety.ir/) and also add it to the `.env` file.
- The prefix is what comes in front of the bot's commands in Discord.
- The dashboard URL is where you host your dashboard. By default, the web server is hosted on port `5800`.
- Add a password to get access to the dashboard.

**Example of `.env` file**

```.env
TOKEN=YOURTOKEN
ACCESS_TOKEN_SECRET=YOURTOKEN
PREFIX=!
DASHBOARD_URL=https://dashboard.yourdomain.com
PASSWORD=YOURSTRONGPASSWORD
```

### Start

- Developing: `nodemon index.js`
- Production: `node index.js`
