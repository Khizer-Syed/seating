// hashPassword.js - Run this once to generate your password hash
import bcrypt from 'bcryptjs';

const password = 'admin21!'; // Your desired password
const hash = await bcrypt.hash(password, 10);
console.log('Password Hash:', hash);
console.log('Add this to your .env file as ADMIN_PASSWORD_HASH');