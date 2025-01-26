const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_key_here';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create Users Table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    email TEXT UNIQUE,
    department TEXT,
    password TEXT
)`);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes

// Register User
app.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, department, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users 
            (firstName, lastName, email, department, password) 
            VALUES (?, ?, ?, ?, ?)`;

        db.run(query, [firstName, lastName, email, department, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, email: user.email } });
    });
});

// Get All Users
app.get('/users', authenticateToken, (req, res) => {
    db.all('SELECT id, firstName, lastName, email, department FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get Single User
app.get('/users/:id', authenticateToken, (req, res) => {
    db.get('SELECT id, firstName, lastName, email, department FROM users WHERE id = ?', 
        [req.params.id], 
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (!row) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(row);
    });
});

// Update User
app.put('/users/:id', authenticateToken, (req, res) => {
    const { firstName, lastName, email, department } = req.body;
    db.run(
        `UPDATE users 
         SET firstName = ?, lastName = ?, email = ?, department = ? 
         WHERE id = ?`,
        [firstName, lastName, email, department, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ updated: this.changes });
        }
    );
});

// Delete User
app.delete('/users/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});