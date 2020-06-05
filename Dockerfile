FROM node:13.14.0-alpine3.10

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Bongo Bot API"

WORKDIR /usr/src/node

COPY --chown=node:node package*.json /usr/src/node/
COPY --chown=node:node src/ /usr/src/node/src/

EXPOSE 8443

RUN npm install

WORKDIR /usr/src/node/src
USER node

CMD ["npm", "start"]
