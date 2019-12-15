# docker build -t bongo_bot_api .
# docker run -d -p 8443:8443 --name bongo_bot_api bongo_bot_api
FROM node:latest

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Bongo Bot API"

ENV NODE_ENV=PROD

WORKDIR /usr/src/node

COPY package*.json ./

COPY --chown=node:node config.json /usr/src/node/
COPY --chown=node:node package*.json /usr/src/node/
COPY --chown=node:node src/ /usr/src/node/src/

EXPOSE 8443

RUN npm install

WORKDIR /usr/src/node/src

CMD ["node", "server.js"]
