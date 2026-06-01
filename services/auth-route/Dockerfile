FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/common ./packages/common/
COPY services/auth-route ./services/auth-route/

RUN npm install
RUN npm run build --workspace=@tikitu/common

WORKDIR /app/services/auth-route
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
