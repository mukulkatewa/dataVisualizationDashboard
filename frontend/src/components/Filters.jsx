import { useState, useEffect } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const Filters = ({ filterOptions, activeFilters = {}, onFilterChange, defaultExpanded = false }) => {
    const [filters, setFilters] = useState(activeFilters);
    const [expanded, setExpanded] = useState(defaultExpanded);

    useEffect(() => {
        setFilters(activeFilters);
    }, [activeFilters]);

    const handleChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) delete newFilters[key];
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const resetFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    const activeCount = Object.keys(filters).length;

    if (!filterOptions) {
        return (
            <div className="filters-container">
                <div className="loading" style={{ minHeight: '60px' }}><div className="spinner"></div></div>
            </div>
        );
    }

    return (
        <div className="filters-container">
            <div className="filters-header">
                <div className="filters-title" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
                    <Filter size={18} />
                    <span>Filters</span>
                    {activeCount > 0 && <span className="badge badge-primary" style={{ marginLeft: '8px' }}>{activeCount} active</span>}
                    {expanded ? <ChevronUp size={16} style={{ marginLeft: '8px' }} /> : <ChevronDown size={16} style={{ marginLeft: '8px' }} />}
                </div>
                {activeCount > 0 && (
                    <button className="btn btn-outline" onClick={resetFilters}>
                        <RotateCcw size={14} /> Reset
                    </button>
                )}
            </div>

            {expanded && (
                <div className="filters-grid">
                    <div className="filter-group">
                        <label className="filter-label">End Year</label>
                        <select className="filter-select" value={filters.end_year || ''} onChange={(e) => handleChange('end_year', e.target.value)}>
                            <option value="">All Years</option>
                            {filterOptions.endYears?.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Topic</label>
                        <select className="filter-select" value={filters.topic || ''} onChange={(e) => handleChange('topic', e.target.value)}>
                            <option value="">All Topics</option>
                            {filterOptions.topics?.slice(0, 50).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Sector</label>
                        <select className="filter-select" value={filters.sector || ''} onChange={(e) => handleChange('sector', e.target.value)}>
                            <option value="">All Sectors</option>
                            {filterOptions.sectors?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Region</label>
                        <select className="filter-select" value={filters.region || ''} onChange={(e) => handleChange('region', e.target.value)}>
                            <option value="">All Regions</option>
                            {filterOptions.regions?.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">PEST</label>
                        <select className="filter-select" value={filters.pestle || ''} onChange={(e) => handleChange('pestle', e.target.value)}>
                            <option value="">All Categories</option>
                            {filterOptions.pestles?.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Source</label>
                        <select className="filter-select" value={filters.source || ''} onChange={(e) => handleChange('source', e.target.value)}>
                            <option value="">All Sources</option>
                            {filterOptions.sources?.slice(0, 50).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Country</label>
                        <select className="filter-select" value={filters.country || ''} onChange={(e) => handleChange('country', e.target.value)}>
                            <option value="">All Countries</option>
                            {filterOptions.countries?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">SWOT</label>
                        <select className="filter-select" value={filters.swot || ''} onChange={(e) => handleChange('swot', e.target.value)}>
                            <option value="">All</option>
                            {filterOptions.swot?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Filters;
