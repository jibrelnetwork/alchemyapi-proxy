FROM node:12-slim as build

RUN apt-get update && apt-get install -y ca-certificates wget

RUN wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-alpine-linux-amd64-v0.6.1.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-v0.6.1.tar.gz \
    && rm dockerize-alpine-linux-amd64-v0.6.1.tar.gz

RUN mkdir /app
WORKDIR /app
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package*.json ./
RUN npm install --loglevel warn && npm cache clean --force
COPY . .

RUN npm run build

FROM node:12-slim

RUN mkdir /app
WORKDIR /app
ENV NODE_ENV ${NODE_ENV:-production}

COPY docker/run.sh /bin/run.sh
COPY --from=build /app/dist/. /app/dist/
COPY --from=build /usr/local/bin/dockerize  /usr/local/bin/
COPY version.txt /app/
COPY package*.json ./
RUN npm install --loglevel warn && npm cache clean --force

EXPOSE 3000

CMD ["run.sh", "start"]
