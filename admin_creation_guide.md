# Admin User Creation Guide via SQL Shell

This guide provides instructions on how to create an admin user directly through SQL shell for the tourism website backend.

## Database Connection Details

Use the following credentials to connect to the PostgreSQL database:

- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: sherzod
- **Database**: tour

## Connecting to the Database

1. Open a terminal or command prompt
2. Connect to the PostgreSQL database using the psql command:

```bash
psql -h localhost -p 5432 -U postgres -d tour
```

3. Enter the password when prompted: `sherzod`

## Creating an Admin User

To create an admin user, you need to:

1. Generate a bcrypt hash for the password
2. Insert the user record with the hashed password

### Option 1: Using Node.js to Generate the Password Hash

1. Create a temporary JavaScript file (e.g., `generate-hash.js`) with the following content:

```javascript
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'YourStrongPassword123'; // Replace with your desired password
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Hashed password:', hash);
}

generateHash();
```

2. Run the script with Node.js:

```bash
node generate-hash.js
```

3. Copy the generated hash for use in the SQL command

### Option 2: Using Online Bcrypt Generator

If you don't want to create a script, you can use an online bcrypt generator:

1. Visit a website like https://bcrypt-generator.com/
2. Enter your desired password
3. Set the number of rounds to 10
4. Generate the hash and copy it

### SQL Command to Insert Admin User

Once you have the hashed password, execute the following SQL command in the psql shell:

```sql
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
  'sherzod@gmail.com', -- Replace with your email
  '345345345345345345', -- Replace with the bcrypt hash you generated
  'Your First Name', -- Replace with your first name
  'Your Last Name', -- Replace with your last name
  '+1234567890', -- Replace with your phone number
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

### Verifying the Admin User Creation

To verify that the admin user was created successfully, run:

```sql
SELECT id, email, "firstName", "lastName", role FROM users WHERE role = 'admin';
```

## Logging In

After creating the admin user, you can log in to the application using:
- Email: the email you specified in the SQL command
- Password: the original password you used to generate the hash (not the hash itself)

## Important Notes

1. Make sure to use a strong, secure password
2. The password must meet the application's requirements (at least 8 characters, including uppercase, lowercase, and numbers)
3. Keep your admin credentials secure
4. This method bypasses the application's normal registration process, so ensure you're authorized to create admin users