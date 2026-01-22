require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Insight = require('../models/insights');

const JSON_FILE_PATH = path.join(__dirname, '../../jsondata.json');

// Seeds the database by clearing existing records and batch-inserting JSON data
const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Reading JSON data file...');
        if (!fs.existsSync(JSON_FILE_PATH)) {
            throw new Error(`JSON file not found at: ${JSON_FILE_PATH}`);
        }

        const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
        const jsonData = JSON.parse(rawData);

        if (!Array.isArray(jsonData)) {
            throw new Error('JSON data must be an array');
        }

        console.log(`Found ${jsonData.length} records in JSON file`);

        // Clear existing records to prevent duplicates
        console.log('Clearing existing records...');
        const deleteResult = await Insight.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing records`);

        // Batch insert for better performance
        console.log('Inserting records...');
        const BATCH_SIZE = 500;
        let insertedCount = 0;

        for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
            const batch = jsonData.slice(i, i + BATCH_SIZE);
            await Insight.insertMany(batch, { ordered: false });
            insertedCount += batch.length;
            console.log(`Progress: ${insertedCount}/${jsonData.length} records inserted`);
        }

        const finalCount = await Insight.countDocuments();
        console.log('');
        console.log('='.repeat(45));
        console.log('SEEDING COMPLETE');
        console.log(`Total records in database: ${finalCount}`);
        console.log('='.repeat(45));

        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

seedDatabase();
