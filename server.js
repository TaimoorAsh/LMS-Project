const express = require('express');
const session = require('express-session');
const db = require('./database');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Set up session middleware
app.use(session({
    secret: 'your_secret_key', // Change this to a random, secure value
    resave: false,
    saveUninitialized: true,
}));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Route to display login page
app.get('/', (req, res) => {
    res.render('login');
});

// Route to handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Add your login logic here (e.g., validate credentials against a database)
    if (username === 'admin' && password === 'admin') { // Example credentials
        req.session.user = username; // Store username in session
        res.redirect('/dashboard');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Middleware to check if user is authenticated
function requireLogin(req, res, next) {
    if (req.session.user) {
        next(); // User is authenticated, proceed to the next middleware
    } else {
        res.redirect('/'); // Redirect to login page if not authenticated
    }
}

// Route to display dashboard after login
app.get('/dashboard', requireLogin, (req, res) => {
    res.render('dashboard');
});

// Route to display users (protected route)
app.get('/users', requireLogin, (req, res) => {
    db.all("SELECT * FROM user", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.render('users', { users: rows });
    });
});

// Route to display test data (protected route)
app.get('/tests', requireLogin, (req, res) => {
    db.all("SELECT * FROM test", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.render('tests', { tests: rows });
    });
});

// Route to display update form for a user
app.get('/users/update/:id', requireLogin, (req, res) => {
    const userId = req.params.id;
    db.get("SELECT * FROM user WHERE id = ?", [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).send('User not found');
            return;
        }
        res.render('updateUser', { user: row });
    });
});

// Route to handle update submission for a user
app.post('/users/update/:id', requireLogin, (req, res) => {
    const userId = req.params.id;
    const { name } = req.body;
    db.run("UPDATE user SET name = ? WHERE id = ?", [name, userId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.redirect('/users');
    });
});

// Route to handle delete action for a user
app.get('/users/delete/:id', requireLogin, (req, res) => {
    const userId = req.params.id;
    db.run("DELETE FROM user WHERE id = ?", userId, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`User with ID ${userId} deleted`);
        res.redirect('/users'); // Redirect back to the users list after deletion
    });
});

app.get('/tests/delete/:id', requireLogin, (req, res) => {
    const userId = req.params.id;
    db.run("DELETE FROM test WHERE id = ?", userId, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`User with ID ${userId} deleted`);
        res.redirect('/tests'); // Redirect back to the users list after deletion
    });
});




// Route to display update form for test data
app.get('/tests/update/:id', requireLogin, (req, res) => {
    const testId = req.params.id;
    db.get("SELECT * FROM test WHERE id = ?", [testId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).send('Test data not found');
            return;
        }
        res.render('updateTest', { test: row });
    });
});

// Route to handle update submission for test data
app.post('/tests/update/:id', requireLogin, (req, res) => {
    const testId = req.params.id;
    const { name } = req.body;
    db.run("UPDATE test SET name = ? WHERE id = ?", [name, testId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.redirect('/tests');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
