# Quick Start Guide

Get your Tikitu microservices up and running in minutes!

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- AWS Account (for Cognito)

## 1. Quick Setup

```bash
# Clone and install
git clone <repository-url>
cd tikitu-microservices
npm install

# Run setup script (Unix/Mac)
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# Or manually create databases
createdb admin_db
createdb partner_db
createdb payment_db
createdb notification_db
createdb booking_db
createdb user_db
```

## 2. Configure Environment

Create a `.env` file in the root directory:

```env
# AWS Cognito (Get from AWS Console)
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=your-user-pool-id-here
AWS_COGNITO_CLIENT_ID=your-client-id-here

# Database URLs (adjust credentials if needed)
ADMIN_DATABASE_URL="postgresql://localhost:5432/admin_db"
PARTNER_DATABASE_URL="postgresql://localhost:5432/partner_db"
PAYMENT_DATABASE_URL="postgresql://localhost:5432/payment_db"
NOTIFICATION_DATABASE_URL="postgresql://localhost:5432/notification_db"
BOOKING_DATABASE_URL="postgresql://localhost:5432/booking_db"
USER_DATABASE_URL="postgresql://localhost:5432/user_db"

# Service URLs (default configuration)
ADMIN_SERVICE_URL=http://localhost:3001
PARTNER_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
BOOKING_SERVICE_URL=http://localhost:3005
USER_SERVICE_URL=http://localhost:3006

NODE_ENV=development
```

## 3. Setup AWS Cognito

1. Go to AWS Console → Cognito → User Pools
2. Click "Create user pool"
3. Configure authentication:
   - Sign-in options: Email
   - Password policy: As per your requirements
4. Create user groups: `admin`, `partner`, `user`
5. Create an App Client:
   - App type: Public client
   - Authentication flows: Allow all
6. Copy your User Pool ID and Client ID to `.env`

## 4. Run Database Migrations

```bash
# Generate Prisma clients
npm run prisma:generate

# Run migrations for each service
cd services/admin && npm run prisma:migrate && cd ../..
cd services/partner && npm run prisma:migrate && cd ../..
cd services/payment && npm run prisma:migrate && cd ../..
cd services/notification && npm run prisma:migrate && cd ../..
cd services/booking && npm run prisma:migrate && cd ../..
cd services/user && npm run prisma:migrate && cd ../..
```

## 5. Start Services

```bash
# Option 1: Run all services at once
npm run dev:all

# Option 2: Run services individually (in separate terminals)
npm run dev:auth-route    # API Gateway (Port 3000)
npm run dev:admin         # Admin Service (Port 3001)
npm run dev:partner       # Partner Service (Port 3002)
npm run dev:payment       # Payment Service (Port 3003)
npm run dev:notification  # Notification Service (Port 3004)
npm run dev:booking       # Booking Service (Port 3005)
npm run dev:user          # User Service (Port 3006)
```

## 6. Test the Services

### Check Health

```bash
# Gateway health
curl http://localhost:3000/api/health

# Individual service health
curl http://localhost:3000/api/v1/admin/health
curl http://localhost:3000/api/v1/booking/health
curl http://localhost:3000/api/v1/user/health
```

### Test Authentication

1. Create a test user in AWS Cognito Console
2. Get a JWT token (use AWS Amplify or Cognito API)
3. Make authenticated requests:

```bash
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎉 You're All Set!

Your microservices are now running:

- **API Gateway**: http://localhost:3000
- **Admin**: http://localhost:3001
- **Partner**: http://localhost:3002
- **Payment**: http://localhost:3003
- **Notification**: http://localhost:3004
- **Booking**: http://localhost:3005
- **User**: http://localhost:3006

## Common Issues

### Database Connection Error

```bash
# Make sure PostgreSQL is running
pg_ctl status

# Check if databases exist
psql -l
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma clients
npm run prisma:generate
```

### AWS Cognito Token Verification Failed

- Double-check your User Pool ID and Client ID
- Ensure AWS_REGION matches your Cognito region
- Verify the JWT token is not expired

## Next Steps

1. 📖 Read the full [README.md](./README.md) for detailed documentation
2. 🗂️ Check individual service READMEs for API endpoints
3. 🧪 Add your business logic and endpoints
4. 🚀 Deploy to production

## Need Help?

- Check the main [README.md](./README.md)
- Review individual service documentation
- Create an issue in the repository

Happy coding! 🚀

