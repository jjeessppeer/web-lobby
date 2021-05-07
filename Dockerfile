FROM node:14
COPY package*.json ./
RUN npm install
COPY *.js ./
ADD public /public
EXPOSE 80
CMD ["node", "main.js"]