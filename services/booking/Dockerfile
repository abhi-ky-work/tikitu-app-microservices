FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/common ./packages/common/
COPY services/booking ./services/booking/

RUN npm install
RUN npm run build --workspace=@tikitu/common

WORKDIR /app/services/booking
RUN npx prisma generate
RUN npm run build

EXPOSE 3005
ENV PORT=3005
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
