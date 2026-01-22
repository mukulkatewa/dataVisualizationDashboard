import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InsightsTable from './components/InsightsTable';
import GeographicPage from './components/GeographicPage';
import PestlePage from './components/PestlePage';
import TrendsPage from './components/TrendsPage';
import AnalyticsPage from './components/AnalyticsPage';
import ExportPage from './components/ExportPage';
import './index.css';

const API_BASE = 'http://localhost:5000';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [filters, setFilters] = useState({});
  const [dashboardData, setDashboardData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, statsRes, optionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/dashboard/summary`),
        fetch(`${API_BASE}/api/insights/stats`),
        fetch(`${API_BASE}/api/insights/filters/options`)
      ]);

      const [summaryJson, statsJson, optionsJson] = await Promise.all([
        summaryRes.json(),
        statsRes.json(),
        optionsRes.json()
      ]);

      console.log('Dashboard Summary:', summaryJson);
      console.log('Stats Data:', statsJson);
      console.log('Filter Options:', optionsJson);

      if (summaryJson.success) setDashboardData(summaryJson.data);
      if (statsJson.success) setStatsData(statsJson.data);
      if (optionsJson.success) setFilterOptions(optionsJson.data);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to connect to backend. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);

    if (Object.keys(newFilters).length === 0) {
      loadInitialData();
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(newFilters).forEach(key => {
        if (newFilters[key]) params.append(key, newFilters[key]);
      });

      const res = await fetch(`${API_BASE}/api/insights/filter?${params}&limit=1000`);
      const json = await res.json();

      if (json.success && json.data) {
        const aggregated = aggregateData(json.data);
        console.log('Aggregated filtered data:', aggregated);
        setStatsData(aggregated);
      }
    } catch (err) {
      console.error('Error applying filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const aggregateData = (insights) => {
    const sectorMap = {}, regionMap = {}, topicMap = {}, countryMap = {}, yearMap = {}, pestleMap = {};

    insights.forEach(item => {
      if (item.sector) {
        if (!sectorMap[item.sector]) sectorMap[item.sector] = { sum: 0, count: 0 };
        sectorMap[item.sector].sum += item.intensity || 0;
        sectorMap[item.sector].count++;
      }
      if (item.region) {
        if (!regionMap[item.region]) regionMap[item.region] = { sum: 0, count: 0 };
        regionMap[item.region].sum += item.likelihood || 0;
        regionMap[item.region].count++;
      }
      if (item.topic) {
        if (!topicMap[item.topic]) topicMap[item.topic] = { sum: 0, count: 0 };
        topicMap[item.topic].sum += item.relevance || 0;
        topicMap[item.topic].count++;
      }
      if (item.country) {
        countryMap[item.country] = (countryMap[item.country] || 0) + 1;
      }
      if (item.end_year && typeof item.end_year === 'number') {
        yearMap[item.end_year] = (yearMap[item.end_year] || 0) + 1;
      }
      if (item.pestle) {
        pestleMap[item.pestle] = (pestleMap[item.pestle] || 0) + 1;
      }
    });

    return {
      totalInsights: insights.length,
      intensityBySector: Object.entries(sectorMap).map(([_id, d]) => ({ _id, avgIntensity: d.sum / d.count, count: d.count })).sort((a, b) => b.avgIntensity - a.avgIntensity).slice(0, 15),
      likelihoodByRegion: Object.entries(regionMap).map(([_id, d]) => ({ _id, avgLikelihood: d.sum / d.count, count: d.count })).sort((a, b) => b.avgLikelihood - a.avgLikelihood),
      relevanceByTopic: Object.entries(topicMap).map(([_id, d]) => ({ _id, avgRelevance: d.sum / d.count, count: d.count })).sort((a, b) => b.count - a.count).slice(0, 20),
      topCountries: Object.entries(countryMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => b.count - a.count).slice(0, 15),
      countByYear: Object.entries(yearMap).map(([_id, count]) => ({ _id: parseInt(_id), count })).sort((a, b) => a._id - b._id),
      countByPestle: Object.entries(pestleMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => b.count - a.count)
    };
  };

  const handleRefresh = () => {
    setFilters({});
    loadInitialData();
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    if (error) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '40px' }}>
            <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Connection Error</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
            <button className="btn btn-primary" onClick={handleRefresh}>Retry</button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'insights':
        return <InsightsTable filters={filters} />;
      case 'geographic':
        return <GeographicPage />;
      case 'pestle':
        return <PestlePage />;
      case 'trends':
        return <TrendsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'export':
        return <ExportPage />;
      case 'filters':
        return <Dashboard data={dashboardData} statsData={statsData} loading={loading} filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} onRefresh={handleRefresh} showFiltersExpanded={true} />;
      case 'dashboard':
      default:
        return <Dashboard data={dashboardData} statsData={statsData} loading={loading} filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} onRefresh={handleRefresh} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigation} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
