FROM node:22.12.0-slim

RUN apt update && \
    apt install -y openssl procps python3 && \
    npm install -g @nestjs/cli@10.4.2

ENV PYTHON=/usr/bin/python3

USER node

WORKDIR /home/node/app

CMD [ "tail", "-f", "/dev/null" ]