FROM node:14.10.1

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 80

CMD ["npm", "run", "start"]