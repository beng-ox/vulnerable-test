const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { exec } = require('child_process');

const app = express();
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

// Vulnerable to prototype pollution (CVE-2023-26136)
app.use((req, res, next) => {
  const params = req.query;
  const obj = {};
  
  // Vulnerable merging of query parameters
  for (let key in params) {
    let value = params[key];
    let target = obj;
    let parts = key.split('.');
    let last = parts.pop();
    
    parts.forEach(part => {
      target = target[part] = target[part] || {};
    });
    
    target[last] = value;
  }
  
  req.pollutableObject = obj;
  next();
});

// Route that uses the pollutable object
app.get('/vulnerable-endpoint', (req, res) => {
  const userInput = req.pollutableObject;
  res.json(userInput);
});

// Database setup
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("CREATE TABLE notes (id INTEGER PRIMARY KEY, user_id INTEGER, content TEXT)");
  
  // Vulnerable: Plain text password storage
  db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
});

// Root route - Login page
app.get('/', (req, res) => {
  res.render('login', { error: req.query.error });
});

// Vulnerable: No input validation, SQL Injection possible
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.get(query, (err, user) => {
    if (user) {
      // Vulnerable: Insecure session management
      res.cookie('user', username, { httpOnly: false });
      res.redirect('/dashboard');
    } else {
      res.redirect('/?error=1');
    }
  });
});

// Vulnerable: No authentication check
app.get('/dashboard', (req, res) => {
  const username = req.cookies.user;
  res.render('dashboard', { username });
});

// Vulnerable: Command Injection
app.post('/ping', (req, res) => {
  const { host } = req.body;
  // Vulnerable: Direct command injection
  exec(`ping ${host}`, (error, stdout, stderr) => {
    res.send(stdout || stderr);
  });
});

// Vulnerable: Stored XSS
app.post('/notes', (req, res) => {
  const { content } = req.body;
  const username = req.cookies.user;
  
  // Vulnerable: No input sanitization
  db.run("INSERT INTO notes (user_id, content) VALUES ((SELECT id FROM users WHERE username = ?), ?)",
    [username, content], (err) => {
      res.redirect('/dashboard');
    });
});

// Vulnerable: Information Disclosure
app.get('/debug', (req, res) => {
  // Vulnerable: Exposes sensitive information
  res.json({
    environment: process.env,
    dbConfig: {
      type: 'sqlite3',
      memory: true,
      users: 'users table present'
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Vulnerable app running at http://localhost:${port}`);
}); 