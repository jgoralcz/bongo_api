FROM node:13.14.0-alpine3.10

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Bongo Bot API"

WORKDIR /usr/node

COPY --chown=node:node package*.json /usr/node/
COPY --chown=node:node src/ /usr/node/src/

RUN mkdir logs && chown -R node:node logs

EXPOSE 8443

RUN npm install

WORKDIR /usr/node/src
USER node

CMD ["npm", "start"]
