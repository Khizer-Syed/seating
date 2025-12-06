// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// In production, store this in a database
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD
}

const ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check username
        if (username !== ADMIN_CREDENTIALS.username) {
            return res.status(401).json({ error: 'Invalid username' });
        }

        // For development, you can use plain text comparison (NOT RECOMMENDED FOR PRODUCTION)
        // if (password !== 'yourpassword') {

        // For production, use bcrypt
        const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate token
        const token = jwt.sign(
            { username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, expiresIn: '24h' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/verify - Verify if token is valid
router.post('/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ valid: false });
    }

    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) {
            return res.status(403).json({ valid: false });
        }
        res.json({ valid: true });
    });
});

export default router;