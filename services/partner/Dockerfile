FROM node:22-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
# Copy prisma files early for generation
COPY prisma ./prisma/
COPY prisma.config.js ./
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3002

ENV PORT=3002
ENV NODE_ENV=production

CMD ["npm", "start"]
