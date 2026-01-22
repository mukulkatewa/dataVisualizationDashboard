/**
 * Blackcoffer Data Visualization Dashboard - Backend Server
 * 
 * A Node.js Express API for the data visualization dashboard.
 * Features:
 * - RESTful API endpoints
 * - MongoDB Atlas integration
 * - CORS enabled for frontend access
 * - Environment-based configuration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const healthRoutes = require('./routes/health');
const insightRoutes = require('./routes/insights');

// Initialize Express app
const app = express();

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────

// Enable CORS for all origins (configure for production)
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
        next();
    });
}

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

// Health check route
app.use('/health', healthRoutes);

// API routes
app.use('/api/insights', insightRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Blackcoffer Data Visualization Dashboard API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            insights: '/api/insights',
            filter: '/api/insights/filter',
            stats: '/api/insights/stats',
            filterOptions: '/api/insights/filters/options'
        }
    });
});

// ─────────────────────────────────────────────────────────────
// Error Handling Middleware
// ─────────────────────────────────────────────────────────────

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// ─────────────────────────────────────────────────────────────
// Server Startup
// ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`  🚀 Server running on port ${PORT}`);
            console.log(`  📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  🔗 API URL: http://localhost:${PORT}`);
            console.log('═══════════════════════════════════════════════════════════');
            console.log('');
            console.log('Available endpoints:');
            console.log(`  GET  /health                    - Health check`);
            console.log(`  GET  /api/insights              - Get all insights (paginated)`);
            console.log(`  GET  /api/insights/filter       - Filter insights`);
            console.log(`  GET  /api/insights/stats        - Get statistics`);
            console.log(`  GET  /api/insights/filters/options - Get filter options`);
            console.log(`  GET  /api/insights/:id          - Get single insight`);
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
