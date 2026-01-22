const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Returns server health status including database connection state
router.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: { status: dbStatus[dbState] || 'unknown', name: mongoose.connection.name || 'not connected' }
    });
});

module.exports = router;
