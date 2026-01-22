import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';

const API_BASE = 'http://localhost:5000';

const GeographicPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [heatmapRes, breakdownRes] = await Promise.all([
                fetch(`${API_BASE}/api/analytics/geo/heatmap?level=country`),
                fetch(`${API_BASE}/api/analytics/geo/regional-breakdown`)
            ]);
            const heatmap = await heatmapRes.json();
            const breakdown = await breakdownRes.json();

            setData({ heatmap: heatmap.data, breakdown: breakdown.data });
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading" style={{ height: '60vh' }}><div className="spinner"></div></div>;

    const colors = ['#7367f0', '#28c76f', '#ff9f43', '#00cfe8', '#ea5455', '#82868b', '#9e95f5', '#48da89'];

    const countryChart = {
        labels: data?.heatmap?.slice(0, 15).map(d => d._id) || [],
        datasets: [{ label: 'Insights Count', data: data?.heatmap?.slice(0, 15).map(d => d.count) || [], backgroundColor: colors, borderRadius: 6 }]
    };

    const regionChart = {
        labels: data?.breakdown?.map(d => d._id) || [],
        datasets: [{ data: data?.breakdown?.map(d => d.totalCount) || [], backgroundColor: colors, borderWidth: 0 }]
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Globe /> Geographic Analysis
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Insights distribution by country and region</p>
            </div>

            <div className="charts-grid">
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Top Countries</h3></div>
                    <div className="card-body"><div className="chart-container"><Bar data={countryChart} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} /></div></div>
                </div>
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Regional Distribution</h3></div>
                    <div className="card-body"><div className="chart-container"><Doughnut data={regionChart} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%' }} /></div></div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title">Regional Breakdown</h3></div>
                <div className="card-body">
                    <table className="data-table">
                        <thead><tr><th>Region</th><th>Countries</th><th>Insights</th><th>Avg Intensity</th></tr></thead>
                        <tbody>
                            {data?.breakdown?.map((region, i) => (
                                <tr key={i}>
                                    <td><strong>{region._id}</strong></td>
                                    <td>{region.countries?.length || 0}</td>
                                    <td><span className="badge badge-primary">{region.totalCount}</span></td>
                                    <td>{region.avgIntensity?.toFixed(2) || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GeographicPage;
