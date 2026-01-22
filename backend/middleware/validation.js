// Validates pagination query parameters
const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;

    if (page !== undefined) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({ success: false, error: 'Invalid page parameter. Must be a positive integer.' });
        }
        req.query.page = pageNum;
    }

    if (limit !== undefined) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 500) {
            return res.status(400).json({ success: false, error: 'Invalid limit parameter. Must be between 1 and 500.' });
        }
        req.query.limit = limitNum;
    }

    next();
};

// Validates MongoDB ObjectId format in URL params
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (id && !objectIdRegex.test(id)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format. Must be a valid MongoDB ObjectId.' });
    }

    next();
};

// Validates year query parameters are within acceptable range
const validateYearParams = (req, res, next) => {
    const { end_year, start_year } = req.query;
    const minYear = 1900;
    const maxYear = 2100;

    if (end_year !== undefined && end_year !== '') {
        const year = parseInt(end_year);
        if (isNaN(year) || year < minYear || year > maxYear) {
            return res.status(400).json({ success: false, error: `Invalid end_year. Must be between ${minYear} and ${maxYear}.` });
        }
    }

    if (start_year !== undefined && start_year !== '') {
        const year = parseInt(start_year);
        if (isNaN(year) || year < minYear || year > maxYear) {
            return res.status(400).json({ success: false, error: `Invalid start_year. Must be between ${minYear} and ${maxYear}.` });
        }
    }

    next();
};

// Validates metric query parameters against allowed values
const validateMetricParams = (req, res, next) => {
    const validMetrics = ['intensity', 'likelihood', 'relevance'];
    const { metric, metric1, metric2 } = req.query;
    const metricsToCheck = [metric, metric1, metric2].filter(m => m !== undefined);

    for (const m of metricsToCheck) {
        if (!validMetrics.includes(m)) {
            return res.status(400).json({ success: false, error: `Invalid metric: ${m}. Valid options: ${validMetrics.join(', ')}` });
        }
    }

    next();
};

// Removes potential MongoDB operators from input to prevent NoSQL injection
const sanitizeInputs = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/[\$]/g, '');
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        }
        return obj;
    };

    if (req.query) sanitize(req.query);
    if (req.body) sanitize(req.body);

    next();
};

// Logs request details with response time for debugging
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
};

module.exports = { validatePagination, validateObjectId, validateYearParams, validateMetricParams, sanitizeInputs, requestLogger };
