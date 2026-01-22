import { RefreshCw } from 'lucide-react';
import StatsCards from './StatsCards';
import Filters from './Filters';
import {
    IntensityBySectorChart,
    PestleChart,
    TopTopicsChart,
    RegionsChart,
    LikelihoodByRegionChart,
    RelevanceByTopicChart,
    CountByYearChart,
    TopCountriesChart,
    YearRangeCard
} from './Charts';

const Dashboard = ({ data, statsData, loading, filters, filterOptions, onFilterChange, onRefresh, showFiltersExpanded }) => {
    if (loading && !data && !statsData) {
        return (
            <div className="loading" style={{ height: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const hasFilters = Object.keys(filters || {}).length > 0;
    const overview = data?.overview || {};
    const totalCount = hasFilters ? statsData?.totalInsights : overview.total;

    return (
        <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Data Visualization Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {hasFilters ? `Showing ${totalCount?.toLocaleString() || 0} filtered insights` : 'Analytics and insights from the Blackcoffer dataset'}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={onRefresh} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <StatsCards overview={overview} />

            <Filters
                filterOptions={filterOptions}
                activeFilters={filters}
                onFilterChange={onFilterChange}
                defaultExpanded={showFiltersExpanded}
            />

            {loading ? (
                <div className="loading" style={{ height: '300px' }}><div className="spinner"></div></div>
            ) : (
                <>
                    <div className="charts-grid">
                        <IntensityBySectorChart data={statsData?.intensityBySector} />
                        <PestleChart data={hasFilters ? statsData?.countByPestle : data?.pestleDistribution} />
                    </div>

                    <div className="charts-grid">
                        <CountByYearChart data={statsData?.countByYear} />
                        <LikelihoodByRegionChart data={statsData?.likelihoodByRegion} />
                    </div>

                    <div className="charts-grid">
                        <TopTopicsChart data={hasFilters ? statsData?.relevanceByTopic : data?.topTopics} />
                        <TopCountriesChart data={statsData?.topCountries} />
                    </div>

                    <div className="charts-grid">
                        <RegionsChart data={data?.topRegions} />
                        <YearRangeCard data={data?.yearRange} overview={overview} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
