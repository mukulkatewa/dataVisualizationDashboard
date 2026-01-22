const mongoose = require('mongoose');

// Establishes MongoDB connection with event listeners for connection state changes
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Fail fast if connection fails
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => console.error(`MongoDB connection error: ${err}`));
        mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected. Attempting to reconnect...'));

        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
