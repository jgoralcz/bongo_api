FROM node:12

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Bongo Bot API"

ENV NODE_ENV=PROD

WORKDIR /usr/src/node

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# graphicsmagick
RUN apt-get update -y && apt-get install -y graphicsmagick graphicsmagick-imagemagick-compat
# node canvas
RUN apt-get update && apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
RUN apt-get clean

# other garbage collector
RUN apt-get update && apt-get install --force-yes -yy \
  libjemalloc1 \
  && rm -rf /var/lib/apt/lists/*
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1

COPY --chown=node:node config.json /usr/src/node/
COPY --chown=node:node package*.json /usr/src/node/
COPY --chown=node:node src/ /usr/src/node/src/

EXPOSE 8443

RUN npm install

WORKDIR /usr/src/app/src

CMD ["node", "index.js"]
