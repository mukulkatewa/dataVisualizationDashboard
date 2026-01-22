import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { Bar, Scatter } from 'react-chartjs-2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [correlationRes, comparisonRes, distributionRes] = await Promise.all([
                fetch(`${API_BASE}/api/analytics/correlation?metric1=intensity&metric2=likelihood&groupBy=sector`),
                fetch(`${API_BASE}/api/analytics/comparison?compareBy=sector&metric=intensity`),
                fetch(`${API_BASE}/api/analytics/distribution/intensity`)
            ]);
            const correlation = await correlationRes.json();
            const comparison = await comparisonRes.json();
            const distribution = await distributionRes.json();

            setData({ correlation: correlation.data, comparison: comparison.data, distribution: distribution.data });
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading" style={{ height: '60vh' }}><div className="spinner"></div></div>;

    const colors = ['#7367f0', '#28c76f', '#ff9f43', '#00cfe8', '#ea5455'];

    const comparisonChart = {
        labels: data?.comparison?.slice(0, 10).map(d => d._id?.substring(0, 12)) || [],
        datasets: [
            { label: 'Average', data: data?.comparison?.slice(0, 10).map(d => d.average?.toFixed(2)) || [], backgroundColor: '#7367f0', borderRadius: 6 },
            { label: 'Max', data: data?.comparison?.slice(0, 10).map(d => d.max) || [], backgroundColor: '#28c76f', borderRadius: 6 }
        ]
    };

    const distributionChart = {
        labels: data?.distribution?.map(d => d.range) || [],
        datasets: [{ label: 'Count', data: data?.distribution?.map(d => d.count) || [], backgroundColor: '#00cfe8', borderRadius: 6 }]
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BarChart3 /> Advanced Analytics
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Correlation, comparison, and distribution analysis</p>
            </div>

            <div className="charts-grid">
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Intensity Comparison by Sector</h3></div>
                    <div className="card-body"><div className="chart-container"><Bar data={comparisonChart} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>
                </div>
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Intensity Distribution</h3></div>
                    <div className="card-body"><div className="chart-container"><Bar data={distributionChart} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title">Correlation: Intensity vs Likelihood by Sector</h3></div>
                <div className="card-body">
                    <table className="data-table">
                        <thead><tr><th>Sector</th><th>Avg Intensity</th><th>Avg Likelihood</th><th>Max Intensity</th><th>Max Likelihood</th><th>Count</th></tr></thead>
                        <tbody>
                            {data?.correlation?.slice(0, 15).map((item, i) => (
                                <tr key={i}>
                                    <td><strong>{item._id}</strong></td>
                                    <td><span className="badge badge-primary">{item.avg_intensity?.toFixed(2)}</span></td>
                                    <td><span className="badge badge-success">{item.avg_likelihood?.toFixed(2)}</span></td>
                                    <td>{item.max_intensity}</td>
                                    <td>{item.max_likelihood}</td>
                                    <td>{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
