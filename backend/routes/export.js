const express = require('express');
const router = express.Router();
const Insight = require('../models/insights');

// Exports filtered data as downloadable JSON file
router.get('/json', async (req, res) => {
    try {
        const filter = buildFilterFromQuery(req.query);
        const insights = await Insight.find(filter).lean();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=insights_export_${Date.now()}.json`);
        res.send(JSON.stringify(insights, null, 2));
    } catch (error) {
        console.error('JSON export error:', error);
        res.status(500).json({ success: false, error: 'Export failed' });
    }
});

// Exports filtered data as downloadable CSV file
router.get('/csv', async (req, res) => {
    try {
        const filter = buildFilterFromQuery(req.query);
        const insights = await Insight.find(filter).lean();

        if (insights.length === 0) {
            return res.status(404).json({ success: false, error: 'No data to export' });
        }

        // Collect all unique headers from documents
        const headers = new Set(['_id']);
        insights.forEach(insight => Object.keys(insight).forEach(key => headers.add(key)));
        const headerArray = Array.from(headers);

        const csvRows = [headerArray.join(',')];

        insights.forEach(insight => {
            const row = headerArray.map(header => {
                const value = insight[header];
                if (value === null || value === undefined) return '';
                const stringValue = String(value).replace(/"/g, '""');
                return (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) ? `"${stringValue}"` : stringValue;
            });
            csvRows.push(row.join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=insights_export_${Date.now()}.csv`);
        res.send(csvRows.join('\n'));
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ success: false, error: 'Export failed' });
    }
});

// Exports aggregated statistics as downloadable JSON file
router.get('/stats', async (req, res) => {
    try {
        const stats = await Insight.aggregate([
            { $group: { _id: null, totalRecords: { $sum: 1 }, avgIntensity: { $avg: '$intensity' }, avgLikelihood: { $avg: '$likelihood' }, avgRelevance: { $avg: '$relevance' }, maxIntensity: { $max: '$intensity' }, maxLikelihood: { $max: '$likelihood' }, maxRelevance: { $max: '$relevance' } } }
        ]);

        const exportData = { exportedAt: new Date().toISOString(), statistics: stats[0] || {}, query: req.query };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=stats_export_${Date.now()}.json`);
        res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
        console.error('Stats export error:', error);
        res.status(500).json({ success: false, error: 'Export failed' });
    }
});

// Builds MongoDB filter object from query parameters
function buildFilterFromQuery(query) {
    const { sector, topic, region, country, pestle, source, end_year, start_year } = query;
    const filter = {};

    if (sector) filter.sector = { $regex: sector, $options: 'i' };
    if (topic) filter.topic = { $regex: topic, $options: 'i' };
    if (region) filter.region = { $regex: region, $options: 'i' };
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (pestle) filter.pestle = { $regex: pestle, $options: 'i' };
    if (source) filter.source = { $regex: source, $options: 'i' };
    if (end_year) filter.end_year = parseInt(end_year);
    if (start_year) filter.start_year = parseInt(start_year);

    return filter;
}

module.exports = router;
