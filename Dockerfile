FROM node:22-alpine
ENV NODE_ENV=production PORT=10000 MAX_ROOMS=30 MAX_SSE=60 LAN_DISCOVERY=0
WORKDIR /app
COPY War_Commanders_v0.8_Render_Deploy.zip /tmp/game.zip
RUN apk add --no-cache unzip && unzip -q /tmp/game.zip -d /app && rm /tmp/game.zip && test -f /app/server.js && test -f /app/public/index.html
USER node
EXPOSE 10000
CMD ["node", "server.js"]
