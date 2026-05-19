FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=development \
    EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
    CHOKIDAR_USEPOLLING=true \
    WATCHPACK_POLLING=true

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--lan"]
