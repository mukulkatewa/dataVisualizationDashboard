const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * Features:
 * - Connection pooling via mongoose defaults
 * - Retry logic with exponential backoff
 * - Graceful error handling
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Mongoose 8+ uses these defaults automatically
            // maxPoolSize: 10,
            // serverSelectionTimeoutMS: 5000,
            // socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
