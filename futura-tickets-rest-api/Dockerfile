# Then we copy over the modules from above onto a `slim` image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy content
COPY . .

# Install app dependencies and create build
# RUN npm install --force && npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]