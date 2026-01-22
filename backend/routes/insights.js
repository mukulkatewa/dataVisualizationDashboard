const express = require('express');
const router = express.Router();
const Insight = require('../models/insights');

// Returns paginated list of all insights with sorting options
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const [insights, total] = await Promise.all([
            Insight.find().sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(),
            Insight.countDocuments()
        ]);

        res.status(200).json({ success: true, count: insights.length, total, page, totalPages: Math.ceil(total / limit), data: insights });
    } catch (error) {
        console.error('Error fetching insights:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching insights' });
    }
});

// Returns unique values for each filterable field to populate dropdown options
router.get('/filters/options', async (req, res) => {
    try {
        const [endYears, topics, sectors, regions, pestles, sources, countries, cities] = await Promise.all([
            Insight.distinct('end_year').then(vals => vals.filter(v => v !== '' && v !== null).sort((a, b) => a - b)),
            Insight.distinct('topic').then(vals => vals.filter(v => v !== '' && v !== null).sort()),
            Insight.distinct('sector').then(vals => vals.filter(v => v !== '' && v !== null).sort()),
            Insight.distinct('region').then(vals => vals.filter(v => v !== '' && v !== null).sort()),
            Insight.distinct('pestle').then(vals => vals.filter(v => v !== '' && v !== null).sort()),
            Insight.distinct('source').then(vals => vals.filter(v => v !== '' && v !== null).sort()),
            Insight.distinct('country').then(vals => vals.filter(v => v !== '' && v !== null).sort()),
            Insight.distinct('city').then(vals => vals.filter(v => v !== '' && v !== null).sort())
        ]);

        res.status(200).json({
            success: true,
            data: { endYears, topics, sectors, regions, pestles, sources, countries, cities, swot: ['Strength', 'Weakness', 'Opportunity', 'Threat'] }
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching filter options' });
    }
});

// Filters insights based on multiple query parameters with support for range filters
router.get('/filter', async (req, res) => {
    try {
        const { end_year, start_year, topic, sector, region, pestle, source, country, city, swot,
            intensity_min, intensity_max, likelihood_min, likelihood_max, relevance_min, relevance_max,
            search, page = 1, limit = 50 } = req.query;

        const filter = {};

        // Apply exact and regex-based filters
        if (end_year) filter.end_year = isNaN(end_year) ? end_year : parseInt(end_year);
        if (start_year) filter.start_year = isNaN(start_year) ? start_year : parseInt(start_year);
        if (topic) filter.topic = { $regex: topic, $options: 'i' };
        if (sector) filter.sector = { $regex: sector, $options: 'i' };
        if (region) filter.region = { $regex: region, $options: 'i' };
        if (pestle) filter.pestle = { $regex: pestle, $options: 'i' };
        if (source) filter.source = { $regex: source, $options: 'i' };
        if (country) filter.country = { $regex: country, $options: 'i' };
        if (city) filter.city = { $regex: city, $options: 'i' };

        // SWOT search in title and insight fields
        if (swot) {
            filter.$or = [{ title: { $regex: swot, $options: 'i' } }, { insight: { $regex: swot, $options: 'i' } }];
        }

        // Range filters for numeric metrics
        if (intensity_min || intensity_max) {
            filter.intensity = {};
            if (intensity_min) filter.intensity.$gte = parseInt(intensity_min);
            if (intensity_max) filter.intensity.$lte = parseInt(intensity_max);
        }
        if (likelihood_min || likelihood_max) {
            filter.likelihood = {};
            if (likelihood_min) filter.likelihood.$gte = parseInt(likelihood_min);
            if (likelihood_max) filter.likelihood.$lte = parseInt(likelihood_max);
        }
        if (relevance_min || relevance_max) {
            filter.relevance = {};
            if (relevance_min) filter.relevance.$gte = parseInt(relevance_min);
            if (relevance_max) filter.relevance.$lte = parseInt(relevance_max);
        }

        // Full-text search across title and insight
        if (search) {
            const searchFilter = { $or: [{ title: { $regex: search, $options: 'i' } }, { insight: { $regex: search, $options: 'i' } }] };
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, searchFilter];
                delete filter.$or;
            } else {
                filter.$or = searchFilter.$or;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [insights, total] = await Promise.all([
            Insight.find(filter).skip(skip).limit(parseInt(limit)).lean(),
            Insight.countDocuments(filter)
        ]);

        res.status(200).json({ success: true, count: insights.length, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), filters: req.query, data: insights });
    } catch (error) {
        console.error('Error filtering insights:', error);
        res.status(500).json({ success: false, error: 'Server error while filtering insights' });
    }
});

// Returns aggregated statistics for dashboard visualization
router.get('/stats', async (req, res) => {
    try {
        const [totalCount, intensityBySector, likelihoodByRegion, relevanceByTopic, countByYear, countByPestle, topCountries, avgMetrics] = await Promise.all([
            Insight.countDocuments(),
            Insight.aggregate([
                { $match: { sector: { $ne: '' }, intensity: { $exists: true, $ne: null } } },
                { $group: { _id: '$sector', avgIntensity: { $avg: '$intensity' }, count: { $sum: 1 } } },
                { $sort: { avgIntensity: -1 } }, { $limit: 15 }
            ]),
            Insight.aggregate([
                { $match: { region: { $ne: '' }, likelihood: { $exists: true, $ne: null } } },
                { $group: { _id: '$region', avgLikelihood: { $avg: '$likelihood' }, count: { $sum: 1 } } },
                { $sort: { avgLikelihood: -1 } }
            ]),
            Insight.aggregate([
                { $match: { topic: { $ne: '' }, relevance: { $exists: true, $ne: null } } },
                { $group: { _id: '$topic', avgRelevance: { $avg: '$relevance' }, count: { $sum: 1 } } },
                { $sort: { count: -1 } }, { $limit: 20 }
            ]),
            Insight.aggregate([
                { $match: { end_year: { $ne: '', $exists: true, $type: 'number' } } },
                { $group: { _id: '$end_year', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Insight.aggregate([
                { $match: { pestle: { $ne: '' } } },
                { $group: { _id: '$pestle', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Insight.aggregate([
                { $match: { country: { $ne: '' } } },
                { $group: { _id: '$country', count: { $sum: 1 } } },
                { $sort: { count: -1 } }, { $limit: 15 }
            ]),
            Insight.aggregate([
                { $group: { _id: null, avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, avgRelevance: { $avg: '$relevance' }, maxIntensity: { $max: '$intensity' }, maxLikelihood: { $max: '$likelihood' }, maxRelevance: { $max: '$relevance' } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: { totalInsights: totalCount, intensityBySector, likelihoodByRegion, relevanceByTopic, countByYear, countByPestle, topCountries, averageMetrics: avgMetrics[0] || {} }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching statistics' });
    }
});

// Returns a single insight by MongoDB ObjectId
router.get('/:id', async (req, res) => {
    try {
        const insight = await Insight.findById(req.params.id).lean();
        if (!insight) return res.status(404).json({ success: false, error: 'Insight not found' });
        res.status(200).json({ success: true, data: insight });
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid insight ID format' });
        console.error('Error fetching insight:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching insight' });
    }
});

module.exports = router;
