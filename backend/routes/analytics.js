const express = require('express');
const router = express.Router();
const Insight = require('../models/insights');

// Returns correlation data between two metrics grouped by a category
router.get('/correlation', async (req, res) => {
    try {
        const { metric1 = 'intensity', metric2 = 'likelihood', groupBy = 'sector' } = req.query;
        const validMetrics = ['intensity', 'likelihood', 'relevance'];

        if (!validMetrics.includes(metric1) || !validMetrics.includes(metric2)) {
            return res.status(400).json({ success: false, error: `Invalid metrics. Valid options: ${validMetrics.join(', ')}` });
        }

        const correlation = await Insight.aggregate([
            { $match: { [groupBy]: { $ne: '', $exists: true }, [metric1]: { $exists: true, $ne: null, $type: 'number' }, [metric2]: { $exists: true, $ne: null, $type: 'number' } } },
            { $group: { _id: `$${groupBy}`, [`avg_${metric1}`]: { $avg: `$${metric1}` }, [`avg_${metric2}`]: { $avg: `$${metric2}` }, [`max_${metric1}`]: { $max: `$${metric1}` }, [`max_${metric2}`]: { $max: `$${metric2}` }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 20 }
        ]);

        res.status(200).json({ success: true, metrics: { x: metric1, y: metric2, groupBy }, data: correlation });
    } catch (error) {
        console.error('Correlation error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Compares a single metric across different categories with statistical measures
router.get('/comparison', async (req, res) => {
    try {
        const { compareBy = 'sector', metric = 'intensity' } = req.query;

        const comparison = await Insight.aggregate([
            { $match: { [compareBy]: { $ne: '', $exists: true }, [metric]: { $exists: true, $ne: null, $type: 'number' } } },
            { $group: { _id: `$${compareBy}`, average: { $avg: `$${metric}` }, min: { $min: `$${metric}` }, max: { $max: `$${metric}` }, stdDev: { $stdDevPop: `$${metric}` }, count: { $sum: 1 } } },
            { $sort: { average: -1 } }, { $limit: 15 }
        ]);

        res.status(200).json({ success: true, compareBy, metric, data: comparison });
    } catch (error) {
        console.error('Comparison error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Returns yearly trend data for all metrics
router.get('/trends/yearly', async (req, res) => {
    try {
        const { metric = 'intensity', field = 'end_year' } = req.query;

        const yearlyTrends = await Insight.aggregate([
            { $match: { [field]: { $ne: '', $exists: true, $type: 'number' } } },
            { $group: { _id: `$${field}`, avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, avgRelevance: { $avg: '$relevance' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ success: true, field, data: yearlyTrends });
    } catch (error) {
        console.error('Yearly trends error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Returns topic performance trends with yearly breakdown
router.get('/trends/topic', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topicTrends = await Insight.aggregate([
            { $match: { topic: { $ne: '', $exists: true }, end_year: { $type: 'number' } } },
            { $group: { _id: { topic: '$topic', year: '$end_year' }, avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, count: { $sum: 1 } } },
            { $group: { _id: '$_id.topic', yearlyData: { $push: { year: '$_id.year', avgIntensity: '$avgIntensity', avgLikelihood: '$avgLikelihood', count: '$count' } }, totalCount: { $sum: '$count' } } },
            { $sort: { totalCount: -1 } }, { $limit: parseInt(limit) }
        ]);

        res.status(200).json({ success: true, data: topicTrends });
    } catch (error) {
        console.error('Topic trends error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Returns distribution buckets for a metric (for histogram visualization)
router.get('/distribution/:metric', async (req, res) => {
    try {
        const { metric } = req.params;
        const validMetrics = ['intensity', 'likelihood', 'relevance'];

        if (!validMetrics.includes(metric)) {
            return res.status(400).json({ success: false, error: `Invalid metric. Valid options: ${validMetrics.join(', ')}` });
        }

        const distribution = await Insight.aggregate([
            { $match: { [metric]: { $exists: true, $ne: null, $type: 'number' } } },
            { $bucket: { groupBy: `$${metric}`, boundaries: [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 80, 100], default: 'Other', output: { count: { $sum: 1 } } } }
        ]);

        const simplified = distribution.map(d => ({ range: d._id === 'Other' ? 'Other' : `${d._id}-${d._id + 4}`, count: d.count }));
        res.status(200).json({ success: true, metric, data: simplified });
    } catch (error) {
        console.error('Distribution error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Returns geographic data aggregated by country or region for heatmap visualization
router.get('/geo/heatmap', async (req, res) => {
    try {
        const { level = 'country', metric = 'intensity' } = req.query;
        const groupField = level === 'region' ? 'region' : 'country';

        const heatmapData = await Insight.aggregate([
            { $match: { [groupField]: { $ne: '', $exists: true }, [metric]: { $exists: true, $ne: null } } },
            { $group: { _id: `$${groupField}`, avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, avgRelevance: { $avg: '$relevance' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({ success: true, level: groupField, data: heatmapData });
    } catch (error) {
        console.error('Geo heatmap error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Returns hierarchical breakdown of regions with their countries
router.get('/geo/regional-breakdown', async (req, res) => {
    try {
        const breakdown = await Insight.aggregate([
            { $match: { region: { $ne: '', $exists: true }, country: { $ne: '', $exists: true } } },
            { $group: { _id: { region: '$region', country: '$country' }, avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, count: { $sum: 1 } } },
            { $group: { _id: '$_id.region', countries: { $push: { country: '$_id.country', avgIntensity: '$avgIntensity', avgLikelihood: '$avgLikelihood', count: '$count' } }, totalCount: { $sum: '$count' }, avgIntensity: { $avg: '$avgIntensity' } } },
            { $sort: { totalCount: -1 } }
        ]);

        res.status(200).json({ success: true, data: breakdown });
    } catch (error) {
        console.error('Regional breakdown error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Returns PESTLE analysis with sector correlation
router.get('/pestle/breakdown', async (req, res) => {
    try {
        const pestleBreakdown = await Insight.aggregate([
            { $match: { pestle: { $ne: '', $exists: true } } },
            { $group: { _id: { pestle: '$pestle', sector: '$sector' }, avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, avgRelevance: { $avg: '$relevance' }, count: { $sum: 1 } } },
            { $group: { _id: '$_id.pestle', sectors: { $push: { sector: '$_id.sector', avgIntensity: '$avgIntensity', avgLikelihood: '$avgLikelihood', avgRelevance: '$avgRelevance', count: '$count' } }, totalCount: { $sum: '$count' }, overallAvgIntensity: { $avg: '$avgIntensity' }, overallAvgLikelihood: { $avg: '$avgLikelihood' } } },
            { $sort: { totalCount: -1 } }
        ]);

        res.status(200).json({ success: true, data: pestleBreakdown });
    } catch (error) {
        console.error('PESTLE breakdown error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Returns sources ranked by computed reliability score
router.get('/sources/ranking', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const sourceRanking = await Insight.aggregate([
            { $match: { source: { $ne: '', $exists: true } } },
            { $group: { _id: '$source', avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, avgRelevance: { $avg: '$relevance' }, topTopics: { $addToSet: '$topic' }, count: { $sum: 1 } } },
            { $addFields: { reliabilityScore: { $multiply: [{ $avg: ['$avgIntensity', '$avgLikelihood', '$avgRelevance'] }, { $min: [{ $divide: ['$count', 10] }, 5] }] }, topTopics: { $slice: ['$topTopics', 5] } } },
            { $sort: { reliabilityScore: -1 } }, { $limit: parseInt(limit) }
        ]);

        res.status(200).json({ success: true, data: sourceRanking });
    } catch (error) {
        console.error('Source ranking error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Returns comprehensive dashboard summary with all key metrics and top items
router.get('/dashboard/summary', async (req, res) => {
    try {
        const [totalStats, topSectors, topRegions, topTopics, pestleDistribution, yearRange] = await Promise.all([
            Insight.aggregate([
                { $group: { _id: null, total: { $sum: 1 }, avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, avgRelevance: { $avg: '$relevance' }, uniqueTopics: { $addToSet: '$topic' }, uniqueSectors: { $addToSet: '$sector' }, uniqueCountries: { $addToSet: '$country' }, uniqueSources: { $addToSet: '$source' } } },
                { $project: { total: 1, avgIntensity: { $round: ['$avgIntensity', 2] }, avgLikelihood: { $round: ['$avgLikelihood', 2] }, avgRelevance: { $round: ['$avgRelevance', 2] }, topicCount: { $size: { $filter: { input: '$uniqueTopics', as: 't', cond: { $ne: ['$$t', ''] } } } }, sectorCount: { $size: { $filter: { input: '$uniqueSectors', as: 's', cond: { $ne: ['$$s', ''] } } } }, countryCount: { $size: { $filter: { input: '$uniqueCountries', as: 'c', cond: { $ne: ['$$c', ''] } } } }, sourceCount: { $size: { $filter: { input: '$uniqueSources', as: 's', cond: { $ne: ['$$s', ''] } } } } } }
            ]),
            Insight.aggregate([{ $match: { sector: { $ne: '' } } }, { $group: { _id: '$sector', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
            Insight.aggregate([{ $match: { region: { $ne: '' } } }, { $group: { _id: '$region', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
            Insight.aggregate([{ $match: { topic: { $ne: '' } } }, { $group: { _id: '$topic', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
            Insight.aggregate([{ $match: { pestle: { $ne: '' } } }, { $group: { _id: '$pestle', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            Insight.aggregate([{ $match: { end_year: { $type: 'number' } } }, { $group: { _id: null, minYear: { $min: '$end_year' }, maxYear: { $max: '$end_year' } } }])
        ]);

        res.status(200).json({
            success: true,
            data: { overview: totalStats[0] || {}, topSectors, topRegions, topTopics, pestleDistribution, yearRange: yearRange[0] || {} }
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
