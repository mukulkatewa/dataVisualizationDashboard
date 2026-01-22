const mongoose = require('mongoose');

/**
 * Insight Model
 * 
 * Using strict: false to allow dynamic/flexible fields from the JSON data.
 * This is intentional because:
 * - The dataset has many empty string values
 * - Fields vary between records
 * - MongoDB handles schemaless data well
 * 
 * Known fields in the dataset:
 * - end_year, start_year (can be empty string or number)
 * - intensity, likelihood, relevance, impact (numeric metrics)
 * - sector, topic, pestle, source (categorical)
 * - region, country, city (geographic)
 * - title, insight, url (content)
 * - added, published (date strings)
 */
const insightSchema = new mongoose.Schema(
    {},
    {
        strict: false,
        timestamps: true,
        collection: 'insights'
    }
);

// Add index for common query fields (improves filter performance)
insightSchema.index({ sector: 1 });
insightSchema.index({ topic: 1 });
insightSchema.index({ region: 1 });
insightSchema.index({ country: 1 });
insightSchema.index({ pestle: 1 });
insightSchema.index({ source: 1 });
insightSchema.index({ end_year: 1 });
insightSchema.index({ start_year: 1 });

module.exports = mongoose.model('Insight', insightSchema);
