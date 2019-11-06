FROM node:latest

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Bongo Bot API"

ENV NODE_ENV=PROD

COPY --chown=node:node config.json /usr/src/node/
COPY --chown=node:node package*.json /usr/src/node/
COPY --chown=node:node src/ /usr/src/node/src/

WORKDIR /usr/src/node

EXPOSE 8443

USER node

RUN npm install

CMD ["npm", "start"]