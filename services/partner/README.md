# Partner Microservice

Partner service for managing venue partners and their venues in the Tikitu ticket booking system.

## Features

- AWS Cognito authentication
- Partner management
- Venue management
- Health check endpoint

## API Endpoints

### Health Check
- `GET /api/v1/health` - Service health status

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
PARTNER_DATABASE_URL="postgresql://user:password@localhost:5432/partner_db"
AWS_COGNITO_USER_POOL_ID=your-user-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_REGION=us-east-1

# AWS Location Services (For Addresses Autocomplete)
AWS_LOCATION_PLACE_INDEX_NAME=your-place-index-name
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### Setting up AWS Location Service (Place API)
For the addresses module to work (autocomplete and place details), you need to configure an AWS Location Service Place Index:
1. Go to the AWS Console -> Amazon Location Service.
2. Click on **Place indexes** in the sidebar.
3. Create a Place index (e.g. `TikituPlaceIndex`), select the data provider (e.g. Esri or HERE).
4. Assign the name to `AWS_LOCATION_PLACE_INDEX_NAME` in your `.env`.
5. Ensure the IAM user associated with `AWS_ACCESS_KEY_ID` has the following permissions: `geo:SearchPlaceIndexForSuggestions` and `geo:GetPlace` for this index.

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Start the service:
```bash
npm run dev
```

The service will run on http://localhost:3002

