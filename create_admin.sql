-- SQL script to create an admin user
-- Replace the values in the VALUES section with your own information

INSERT INTO users (
  email, 
  password, 
  "firstName", 
  "lastName", 
  "phoneNumber", 
  role, 
  "createdAt", 
  "updatedAt"
) VALUES (
  'admin@yourdomain.com', -- Replace with your email
  '$2b$10$exampleHashReplaceMeWithYourGeneratedHash', -- Replace with the bcrypt hash you generated
  'Admin', -- Replace with your first name
  'User', -- Replace with your last name
  '+1234567890', -- Replace with your phone number
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Verify the admin user was created
SELECT id, email, "firstName", "lastName", role FROM users WHERE role = 'admin';