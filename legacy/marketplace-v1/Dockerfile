# Fetching the latest node image on apline linux
# FROM node:16 as build

# Setting up the work directory
# WORKDIR /app

# Installing dependencies
# COPY package*.json .
# RUN npm install

# Copying all the files in our project
# COPY . .

# Starting our application
# CMD npm run build

FROM nginx:1.21.6-alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Copying all the files in our project
COPY /build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]


