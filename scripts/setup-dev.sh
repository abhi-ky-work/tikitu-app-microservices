#!/bin/bash

# Setup script for local development

echo "🚀 Setting up Tikitu Microservices..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL >= 14.0"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create databases
echo "🗄️  Creating databases..."
createdb admin_db 2>/dev/null || echo "Database admin_db already exists"
createdb partner_db 2>/dev/null || echo "Database partner_db already exists"
createdb payment_db 2>/dev/null || echo "Database payment_db already exists"
createdb notification_db 2>/dev/null || echo "Database notification_db already exists"
createdb booking_db 2>/dev/null || echo "Database booking_db already exists"
createdb user_db 2>/dev/null || echo "Database user_db already exists"

# Generate Prisma clients
echo "🔨 Generating Prisma clients..."
npm run prisma:generate

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Please create one based on the README instructions."
else
    echo "✅ Environment file found"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file with AWS Cognito credentials"
echo "2. Run migrations: cd services/{service} && npm run prisma:migrate"
echo "3. Start all services: npm run dev:all"
echo "4. Or start individual services: npm run dev:{service-name}"
echo ""
echo "📚 Check README.md for detailed instructions"

