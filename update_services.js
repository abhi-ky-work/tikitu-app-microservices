const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const servicesDir = '/Users/abhishekyadav/Documents/project/tikitu-portfolio-projects/tikitu-app-microservices/services';
const services = ['admin', 'payment', 'notification', 'user'];

for (const svc of services) {
  const svcPath = path.join(servicesDir, svc);
  const upperName = svc.toUpperCase();

  // 1. Update package.json
  const pkgPath = path.join(svcPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  delete pkg.dependencies['@prisma/client'];
  delete pkg.devDependencies['prisma'];
  
  pkg.dependencies['@prisma/client'] = '^7.5.0';
  pkg.dependencies['@prisma/adapter-pg'] = '^7.0.0';
  pkg.dependencies['pg'] = '^8.20.0';
  
  pkg.devDependencies['prisma'] = '^7.0.0';
  pkg.devDependencies['@prisma/config'] = '^7.0.0';
  pkg.devDependencies['@types/pg'] = '^8.11.11';
  
  // Sort for neatness
  const sortObj = o => Object.keys(o).sort().reduce((acc, k) => { acc[k] = o[k]; return acc; }, {});
  pkg.dependencies = sortObj(pkg.dependencies);
  pkg.devDependencies = sortObj(pkg.devDependencies);
  
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // 2. Update schema.prisma
  const schemaPath = path.join(svcPath, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    let schemaStr = fs.readFileSync(schemaPath, 'utf8');
    schemaStr = schemaStr.replace(/\s*url\s*=\s*env\("[^"]+"\)/g, '');
    fs.writeFileSync(schemaPath, schemaStr);
  }

  // 3. Update prisma.ts
  const prismaTsPath = path.join(svcPath, 'src', 'lib', 'prisma.ts');
  const prismaTsContent = `import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize the driver adapter
const pool = new Pool({ connectionString: process.env.${upperName}_DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // Use the adapter instead of datasourceUrl
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;
  if (fs.existsSync(prismaTsPath)) {
    fs.writeFileSync(prismaTsPath, prismaTsContent);
  } else {
    // ensure dir
    fs.mkdirSync(path.join(svcPath, 'src', 'lib'), { recursive: true });
    fs.writeFileSync(prismaTsPath, prismaTsContent);
  }

  // 4. Create prisma.config.mts
  const configPath = path.join(svcPath, 'prisma.config.mts');
  const configContent = `import { defineConfig } from '@prisma/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize the driver adapter for runtime usage
const pool = new Pool({ connectionString: process.env.${upperName}_DATABASE_URL });
const adapter = new PrismaPg(pool);

export default defineConfig({
  datasource: {
    url: process.env.${upperName}_DATABASE_URL,
  },
});
`;
  fs.writeFileSync(configPath, configContent);

  // 5. Create .env
  const envPath = path.join(svcPath, '.env');
  const envContent = `${upperName}_DATABASE_URL="postgresql://tikitu:tikitu_password@localhost:5432/${svc}_db"

# AWS Cognito Configuration
AWS_REGION=eu-north-1
AWS_COGNITO_USER_POOL_ID=eu-north-1_NJuTVmA4g
AWS_COGNITO_CLIENT_ID=6du1tc6uk9p45gnapl14t9fkfl
AWS_COGNITO_ISSUER=https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_NJuTVmA4g
`;
  fs.writeFileSync(envPath, envContent);

  console.log(`Updated files for ${svc}`);
}
