// In-memory store for tracking request counts per IP
const requestStore = new Map();

// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requestStore.entries()) {
        if (now - data.windowStart > 60000) requestStore.delete(ip);
    }
}, 300000);

// Creates a rate limiter middleware with configurable window and max requests
const createRateLimiter = (options = {}) => {
    const { windowMs = 60000, max = 100, message = 'Too many requests, please try again later.' } = options;

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();

        let entry = requestStore.get(ip);

        if (!entry || (now - entry.windowStart) > windowMs) {
            entry = { windowStart: now, count: 1 };
            requestStore.set(ip, entry);
        } else {
            entry.count++;
        }

        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
        res.setHeader('X-RateLimit-Reset', new Date(entry.windowStart + windowMs).toISOString());

        if (entry.count > max) {
            return res.status(429).json({ success: false, error: message, retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000) });
        }

        next();
    };
};

// Pre-configured limiters for different use cases
const standardLimiter = createRateLimiter({ windowMs: 60000, max: 100, message: 'Rate limit exceeded. Please try again in a minute.' });
const strictLimiter = createRateLimiter({ windowMs: 60000, max: 30, message: 'Rate limit exceeded for this endpoint.' });
const exportLimiter = createRateLimiter({ windowMs: 300000, max: 10, message: 'Export rate limit exceeded. Please wait before exporting again.' });

module.exports = { createRateLimiter, standardLimiter, strictLimiter, exportLimiter };
