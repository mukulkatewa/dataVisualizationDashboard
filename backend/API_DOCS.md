# Blackcoffer Data Visualization Dashboard - API Documentation

## Base URL
```
http://localhost:5000
```

## Rate Limits
- **Standard endpoints**: 100 requests per minute
- **Export endpoints**: 10 requests per 5 minutes

---

## Health Check

### GET /health
Returns server and database status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-22T12:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "name": "blackcoffer_dashboard"
  }
}
```

---

## Insights API

### GET /api/insights
Get all insights with pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Items per page (max 500) |
| sortBy | string | createdAt | Field to sort by |
| sortOrder | string | desc | asc or desc |

**Response:**
```json
{
  "success": true,
  "count": 50,
  "total": 1000,
  "page": 1,
  "totalPages": 20,
  "data": [...]
}
```

---

### GET /api/insights/filter
Filter insights by multiple criteria.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| end_year | number | Filter by end year |
| start_year | number | Filter by start year |
| topic | string | Filter by topic (partial match) |
| sector | string | Filter by sector |
| region | string | Filter by region |
| pestle | string | PEST filter (Political, Economic, Social, Technological) |
| source | string | Filter by source |
| country | string | Filter by country |
| city | string | Filter by city |
| swot | string | Search SWOT keywords |
| search | string | Full-text search in title/insight |
| intensity_min | number | Minimum intensity |
| intensity_max | number | Maximum intensity |
| likelihood_min | number | Minimum likelihood |
| likelihood_max | number | Maximum likelihood |
| relevance_min | number | Minimum relevance |
| relevance_max | number | Maximum relevance |

**Example:**
```
GET /api/insights/filter?sector=Energy&region=Northern America&intensity_min=10
```

---

### GET /api/insights/stats
Get aggregated statistics for dashboard.

**Response includes:**
- Total insights count
- Average intensity by sector
- Average likelihood by region
- Relevance by topic
- Count by year
- Count by PESTLE
- Top countries

---

### GET /api/insights/filters/options
Get unique values for all filter dropdowns.

**Response:**
```json
{
  "success": true,
  "data": {
    "endYears": [2017, 2018, 2019, ...],
    "topics": ["oil", "gas", "energy", ...],
    "sectors": ["Energy", "Government", ...],
    "regions": ["Northern America", "World", ...],
    "pestles": ["Economic", "Political", ...],
    "sources": ["EIA", "Reuters", ...],
    "countries": ["United States of America", "India", ...],
    "cities": [...],
    "swot": ["Strength", "Weakness", "Opportunity", "Threat"]
  }
}
```

---

## Analytics API

### GET /api/analytics/correlation
Get correlation between two metrics grouped by category.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| metric1 | string | intensity | First metric |
| metric2 | string | likelihood | Second metric |
| groupBy | string | sector | Group by field |

**Valid metrics:** intensity, likelihood, relevance

---

### GET /api/analytics/comparison
Compare a metric across different categories.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| compareBy | string | sector | Category to compare |
| metric | string | intensity | Metric to analyze |

---

### GET /api/analytics/trends/yearly
Get yearly trends for metrics.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| metric | string | intensity | Metric to analyze |
| field | string | end_year | Year field to use |

---

### GET /api/analytics/trends/topic
Get topic trends with metrics over time.

---

### GET /api/analytics/distribution/:metric
Get distribution data for histogram charts.

**URL Parameters:**
- metric: intensity | likelihood | relevance

---

### GET /api/analytics/geo/heatmap
Get geographic heatmap data.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| level | string | country | country or region |
| metric | string | intensity | Metric to map |

---

### GET /api/analytics/geo/regional-breakdown
Get breakdown by region with country details.

---

### GET /api/analytics/pestle/breakdown
Get PESTLE analysis with sector correlation.

---

### GET /api/analytics/sources/ranking
Get source ranking by reliability score.

---

### GET /api/analytics/dashboard/summary
Get comprehensive dashboard summary with all key metrics.

---

## Export API

### GET /api/export/json
Download filtered data as JSON file.

**Supports all filter query parameters from /api/insights/filter**

---

### GET /api/export/csv
Download filtered data as CSV file.

**Supports all filter query parameters from /api/insights/filter**

---

### GET /api/export/stats
Download statistics summary as JSON file.

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- 200: Success
- 400: Bad Request (invalid parameters)
- 404: Not Found
- 429: Rate Limit Exceeded
- 500: Server Error
