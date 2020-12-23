FROM node:13.14.0-alpine3.10

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Bongo Bot API"

WORKDIR /usr/node

RUN mkdir logs && chown -R node:node logs

COPY --chown=node:node package*.json /usr/node/

RUN npm install

COPY --chown=node:node src/ /usr/node/src/

WORKDIR /usr/node/src

USER node

EXPOSE 8443
CMD ["npm", "start"]
