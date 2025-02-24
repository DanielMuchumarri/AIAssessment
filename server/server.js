const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const Redis = require("ioredis");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Enable security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: "https://localhost:3000.com", // Update with your frontend domain
    credentials: true,
  })
);

app.use(bodyParser.json());

// Load HTTPS SSL Certificates (Self-signed for local, Use proper SSL for production)
const httpsOptions = {
  key: fs.readFileSync("C:\\Daniel\\AIEnabledAssessment\\Cert_Keys\\key.pem"),
  cert: fs.readFileSync("C:\\Daniel\\AIEnabledAssessment\\Cert_Keys\\cert.pem"),
};

// Environment Variables
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key";

// 1. Create and connect a Redis client
const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

// Handle Redis errors
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// 2. Set up session management with Redis
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Enforce HTTPS-only cookies
      httpOnly: true, // Prevent JavaScript access
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// 3. MySQL connection
const dbConfig = {
  host: "localhost",
  port: 3306,
  user: "app_admin@aiassessment.com",
  password: "admin@123",
  database: "aiassessment",
  debug: true, // Enable debugging
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Simple test route to check session storage
app.get("/api/session-test", (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views++;
  }
  res.json({ message: "Session working!", views: req.session.views });
});

// Example route querying the database
app.get("/api/users", (req, res) => {
  const query = "SELECT * FROM mysql.user"; // Adjust table name
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// 4. Start HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Secure HTTPS Server is running on port ${PORT}`);
});
