const bcrypt = require('bcrypt');

async function generateHash() {
  // You can change this password to your desired password
  const password = 'AdminPassword123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hashed password:', hash);
    console.log('\nUse this hash in your SQL command to create an admin user.');
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();