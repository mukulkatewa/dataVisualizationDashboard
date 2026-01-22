const mongoose = require('mongoose');

// Flexible schema to accommodate varying JSON data structure (strict: false allows dynamic fields)
const insightSchema = new mongoose.Schema({}, { strict: false, timestamps: true, collection: 'insights' });

// Indexes for optimizing frequently queried fields
insightSchema.index({ sector: 1 });
insightSchema.index({ topic: 1 });
insightSchema.index({ region: 1 });
insightSchema.index({ country: 1 });
insightSchema.index({ pestle: 1 });
insightSchema.index({ source: 1 });
insightSchema.index({ end_year: 1 });
insightSchema.index({ start_year: 1 });

module.exports = mongoose.model('Insight', insightSchema);
