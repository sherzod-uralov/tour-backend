# Creating Admin Users via SQL Shell

This directory contains files to help you create admin users directly through SQL shell for the tourism website backend.

## Files Included

1. **admin_creation_guide.md** - Comprehensive guide with step-by-step instructions for creating admin users through SQL shell
2. **generate-hash.js** - Node.js script to generate a bcrypt hash for your password
3. **create_admin.sql** - SQL script template for inserting an admin user into the database

## Quick Start Guide

1. **Generate a password hash**:
   ```bash
   node generate-hash.js
   ```
   This will output a hashed version of the default password 'AdminPassword123'. You can edit the script to use your own password.

2. **Edit the SQL script**:
   Open `create_admin.sql` and replace the placeholder values with your information:
   - Replace the email with your email address
   - Replace the hash with the one generated in step 1
   - Replace the first name, last name, and phone number with your information

3. **Connect to the database**:
   ```bash
   psql -h localhost -p 5432 -U postgres -d tour
   ```
   Enter the password `sherzod` when prompted.

4. **Execute the SQL script**:
   In the psql shell, run:
   ```sql
   \i create_admin.sql
   ```
   This will create the admin user and verify that it was created successfully.

5. **Log in to the application**:
   Use the email and original password (not the hash) to log in to the application.

## Detailed Instructions

For more detailed instructions, please refer to the `admin_creation_guide.md` file.

## Important Notes

- Make sure you have the necessary permissions to create admin users
- Use a strong, secure password that meets the application's requirements
- Keep your admin credentials secure
- This method bypasses the application's normal registration process