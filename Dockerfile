FROM node:11
WORKDIR /usr/src/app
RUN npm install
ENV PORT=8000
EXPOSE ${PORT}
CMD [ "npm", "start" ]
