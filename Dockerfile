FROM node:22-alpine
ENV NODE_ENV=production PORT=10000 MAX_ROOMS=30 MAX_SSE=60
WORKDIR /app
COPY package.json server.js ./
COPY public/ ./public/
USER node
EXPOSE 10000
CMD ["node", "server.js"]
