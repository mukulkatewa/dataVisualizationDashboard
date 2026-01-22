require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const healthRoutes = require('./routes/health');
const insightRoutes = require('./routes/insights');
const analyticsRoutes = require('./routes/analytics');
const exportRoutes = require('./routes/export');
const authRoutes = require('./routes/auth');

const { sanitizeInputs, requestLogger } = require('./middleware/validation');
const { standardLimiter, exportLimiter } = require('./middleware/rateLimiter');

const app = express();

// CORS configuration - restrict origin in production
app.use(cors({
    origin: '*', // Allow all origins for simplicity in this deployment
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(standardLimiter);
app.use(sanitizeInputs);

// Ensure DB connection for Serverless environment
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState === 0) {
        try {
            await connectDB();
        } catch (error) {
            console.error('DB Connection Error:', error);
        }
    }
    next();
});

if (process.env.NODE_ENV !== 'production') {
    app.use(requestLogger);
}

// Route mounting
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportLimiter, exportRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'Blackcoffer Dashboard API',
        version: '1.0.0',
        endpoints: {
            health: { 'GET /health': 'Health check with database status' },
            insights: {
                'GET /api/insights': 'Get all insights (paginated)',
                'GET /api/insights/:id': 'Get single insight by ID',
                'GET /api/insights/filter': 'Filter insights by multiple criteria',
                'GET /api/insights/stats': 'Get aggregated statistics',
                'GET /api/insights/filters/options': 'Get unique filter values for dropdowns'
            },
            analytics: {
                'GET /api/analytics/correlation': 'Correlation between metrics',
                'GET /api/analytics/comparison': 'Compare metrics across categories',
                'GET /api/analytics/trends/yearly': 'Yearly trends for metrics',
                'GET /api/analytics/trends/topic': 'Topic trends over time',
                'GET /api/analytics/distribution/:metric': 'Distribution histogram data',
                'GET /api/analytics/geo/heatmap': 'Geographic heatmap data',
                'GET /api/analytics/geo/regional-breakdown': 'Regional breakdown with countries',
                'GET /api/analytics/pestle/breakdown': 'PESTLE analysis breakdown',
                'GET /api/analytics/sources/ranking': 'Source reliability ranking',
                'GET /api/analytics/dashboard/summary': 'Comprehensive dashboard summary'
            },
            export: {
                'GET /api/export/json': 'Export data as JSON file',
                'GET /api/export/csv': 'Export data as CSV file',
                'GET /api/export/stats': 'Export statistics summary'
            }
        },
        rateLimit: { standard: '100 requests per minute', export: '10 exports per 5 minutes' }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Blackcoffer Data Visualization Dashboard API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: { health: '/health', insights: '/api/insights', analytics: '/api/analytics', export: '/api/export', docs: '/api/docs' }
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, error: 'Endpoint not found', path: req.path, hint: 'Visit /api/docs for available endpoints' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 5000;

// Server initialization
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(60));
            console.log(`  Server running on port ${PORT}`);
            console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  API URL: http://localhost:${PORT}`);
            console.log(`  API Docs: http://localhost:${PORT}/api/docs`);
            console.log('='.repeat(60));
            console.log('');
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Process error handlers
process.on('unhandledRejection', (err) => { console.error('Unhandled Promise Rejection:', err); process.exit(1); });
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); process.exit(1); });
process.on('SIGTERM', async () => { console.log('SIGTERM received. Shutting down gracefully...'); process.exit(0); });

if (require.main === module) {
    startServer();
}

module.exports = app;
