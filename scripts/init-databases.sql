-- Initialize databases for all microservices

-- Create databases
CREATE DATABASE admin_db;
CREATE DATABASE partner_db;
CREATE DATABASE payment_db;
CREATE DATABASE notification_db;
CREATE DATABASE booking_db;
CREATE DATABASE user_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE admin_db TO tikitu;
GRANT ALL PRIVILEGES ON DATABASE partner_db TO tikitu;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO tikitu;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO tikitu;
GRANT ALL PRIVILEGES ON DATABASE booking_db TO tikitu;
GRANT ALL PRIVILEGES ON DATABASE user_db TO tikitu;

