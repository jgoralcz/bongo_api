# docker stop bongo_bot_api || true && docker rm bongo_bot_api || true && docker build -t bongo_bot_api . && docker run -d -p 8443:8443 -v /etc/nginx/ssl/cert.key:/node/config/cert.key -v /etc/nginx/ssl/cert.pem:/node/config/cert.pem --restart always --memory="2048m" --name bongo_bot_api bongo_bot_api;
FROM node:latest

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Bongo Bot API"

ENV NODE_ENV=PROD

WORKDIR /usr/src/node

COPY --chown=node:node config.json /usr/src/node/
COPY --chown=node:node package*.json /usr/src/node/
COPY --chown=node:node src/ /usr/src/node/src/

EXPOSE 8443

RUN npm install

WORKDIR /usr/src/node/src
USER node

CMD ["node", "server.js"]
