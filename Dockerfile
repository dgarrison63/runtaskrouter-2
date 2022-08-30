#Download base image ubuntu 20.04
FROM ubuntu:20.04

# LABEL about the custom image
LABEL maintainer="d.garrison@f5.com"
LABEL version="0.1"
LABEL description="F5 Terraform Run Task Router"

# Disable Prompt During Packages Installation
ARG DEBIAN_FRONTEND=noninteractive

# Update Ubuntu Software repository
RUN apt update
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x  | bash -
RUN apt-get -y install nodejs
WORKDIR /usr/app
COPY ./ ./
RUN npm install axios koa koa-bodyparser json-query koa-router
RUN apt clean

# Copy logPublisher.js script and config file then start logReceiverProxy
COPY app.js /usr/app/app.js

ENTRYPOINT ["node", "app.js"]