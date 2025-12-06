import express from "express";
import compression from "compression";
import path from "path";
import mongoose from "mongoose";

import guestRoutes from "./routes/guests.js";
import authRoutes from "./routes/auth.js";
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Gzip/Brotli compression
app.use(compression());

// Static content caching (1 week for CSS/JS/images)
app.use(
    "/",
    express.static("public", {
        maxAge: "7d",       // cache for 7 days
        etag: true,         // enable ETag
        lastModified: true, // enable Last-Modified
        index: "index.html"
    })
);

// API Routes
app.use('/api/guests', guestRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.send({
        message: "Server is running",
        database: mongoose.connection.readyState === 'open' ? 'connected' : 'disconnected'
    });
});

// Serve the index.html for any unknown route (SPA-friendly)
app.get("/admin/login", (req, res) => {
    res.sendFile(path.resolve("public/login.html"));
});

// Serve the index.html for any unknown route (SPA-friendly)
app.get("/admin", (req, res) => {
    res.sendFile(path.resolve("public/admin.html"));
});

// Serve the index.html for any unknown route (SPA-friendly)
app.all("/*splat", (req, res) => {
    res.sendFile(path.resolve("public/index.html"));
});

app.listen(process.env.PORT, () => {
    console.log(`Production server running on port ${process.env.PORT}`);
});
