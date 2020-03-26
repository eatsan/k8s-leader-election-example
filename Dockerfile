FROM node:10
# Create app directory
WORKDIR /usr/src/app
EXPOSE 8080
COPY server.js .
CMD [ "node", "server.js" ]
