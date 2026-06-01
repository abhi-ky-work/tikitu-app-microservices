#!/usr/bin/env node
/**
 * Scaffold a NestJS health-only microservice from the user service template.
 * Usage: node scripts/scaffold-nest-service.js <serviceName> <port> <ENV_PREFIX>
 * Example: node scripts/scaffold-nest-service.js admin 3001 ADMIN
 */
const fs = require('fs');
const path = require('path');

const [serviceName, port, envPrefix] = process.argv.slice(2);
if (!serviceName || !port || !envPrefix) {
  console.error('Usage: node scaffold-nest-service.js <serviceName> <port> <ENV_PREFIX>');
  process.exit(1);
}

const root = path.join(__dirname, '..', 'services', serviceName);
const dbUrl = `${envPrefix}_DATABASE_URL`;
const portEnv = `${envPrefix}_SERVICE_PORT`;

const files = {
  'package.json': JSON.stringify(
    {
      name: `@tikitu/${serviceName}-service`,
      version: '1.0.0',
      private: true,
      scripts: {
        build: 'nest build',
        start: 'node dist/main',
        'start:dev': 'nest start --watch',
        dev: 'nest start --watch',
        'prisma:generate': 'prisma generate',
        'prisma:migrate': 'prisma migrate dev',
        'prisma:studio': 'prisma studio',
      },
      dependencies: {
        '@nestjs/common': '^10.4.15',
        '@nestjs/config': '^3.3.0',
        '@nestjs/core': '^10.4.15',
        '@nestjs/platform-express': '^10.4.15',
        '@prisma/adapter-pg': '^7.0.0',
        '@prisma/client': '^7.5.0',
        '@tikitu/common': '*',
        pg: '^8.20.0',
        'reflect-metadata': '^0.2.2',
        rxjs: '^7.8.1',
      },
      devDependencies: {
        '@nestjs/cli': '^10.4.9',
        '@nestjs/schematics': '^10.2.3',
        '@prisma/config': '^7.0.0',
        '@types/node': '^20.11.0',
        '@types/pg': '^8.11.11',
        dotenv: '^16.6.1',
        prisma: '^7.0.0',
        typescript: '^5.3.0',
      },
    },
    null,
    2,
  ) + '\n',
  'nest-cli.json': fs.readFileSync(path.join(__dirname, '..', 'services/user/nest-cli.json'), 'utf8'),
  'tsconfig.json': fs.readFileSync(path.join(__dirname, '..', 'services/user/tsconfig.json'), 'utf8'),
  'tsconfig.build.json': fs.readFileSync(
    path.join(__dirname, '..', 'services/user/tsconfig.build.json'),
    'utf8',
  ),
  'prisma.config.mts': `import 'dotenv/config';\nimport { defineConfig, env } from '@prisma/config';\n\nexport default defineConfig({\n  datasource: {\n    url: env('${dbUrl}'),\n  },\n});\n`,
  Dockerfile: `FROM node:22-alpine\n\nRUN apk add --no-cache openssl\n\nWORKDIR /app\n\nCOPY package.json package-lock.json* ./\nCOPY prisma ./prisma/\nCOPY prisma.config.mts ./\nRUN npm install\n\nRUN npx prisma generate\n\nCOPY . .\nRUN npm run build\n\nEXPOSE ${port}\n\nENV PORT=${port}\nENV NODE_ENV=production\n\nCMD ["node", "dist/main.js"]\n`,
  'src/main.ts': `import 'reflect-metadata';\nimport { NestFactory } from '@nestjs/core';\nimport { defaultCorsConfig } from '@tikitu/common';\nimport { AppModule } from './app.module';\n\nasync function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n  app.setGlobalPrefix('api');\n  app.enableCors(defaultCorsConfig);\n  const port = process.env.PORT || process.env.${portEnv} || ${port};\n  await app.listen(port);\n  console.log(\`${serviceName} service listening on port \${port}\`);\n}\n\nbootstrap();\n`,
  'src/app.module.ts': `import { Module } from '@nestjs/common';\nimport { ConfigModule } from '@nestjs/config';\nimport { HealthModule } from './health/health.module';\nimport { PrismaModule } from './prisma/prisma.module';\n\n@Module({\n  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, HealthModule],\n})\nexport class AppModule {}\n`,
  'src/prisma/prisma.module.ts': fs.readFileSync(
    path.join(__dirname, '..', 'services/user/src/prisma/prisma.module.ts'),
    'utf8',
  ),
  'src/prisma/prisma.service.ts': `import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';\nimport { PrismaPg } from '@prisma/adapter-pg';\nimport { PrismaClient } from '../../prisma/generated/client';\n\n@Injectable()\nexport class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {\n  constructor() {\n    const adapter = new PrismaPg({\n      connectionString: process.env.${dbUrl},\n    });\n    super({\n      adapter,\n      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],\n    });\n  }\n\n  async onModuleInit() {\n    await this.$connect();\n  }\n\n  async onModuleDestroy() {\n    await this.$disconnect();\n  }\n}\n`,
  'src/health/health.module.ts': fs.readFileSync(
    path.join(__dirname, '..', 'services/user/src/health/health.module.ts'),
    'utf8',
  ),
  'src/health/health.controller.ts': `import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';\nimport { Public } from '@tikitu/common';\nimport { PrismaService } from '../prisma/prisma.service';\n\n@Public()\n@Controller('v1')\nexport class HealthController {\n  constructor(private readonly prisma: PrismaService) {}\n\n  @Get('health')\n  async health() {\n    try {\n      await this.prisma.$queryRaw\`SELECT 1\`;\n      return {\n        status: 'healthy',\n        service: '${serviceName}',\n        timestamp: new Date().toISOString(),\n        version: '1.0.0',\n        database: 'connected',\n      };\n    } catch (error) {\n      throw new ServiceUnavailableException({\n        status: 'unhealthy',\n        service: '${serviceName}',\n        timestamp: new Date().toISOString(),\n        version: '1.0.0',\n        database: 'disconnected',\n        error: error instanceof Error ? error.message : 'Unknown error',\n      });\n    }\n  }\n}\n`,
};

for (const [rel, content] of Object.entries(files)) {
  const filePath = path.join(root, rel);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

console.log(`Scaffolded Nest files for ${serviceName} at ${root}`);
