import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';

const API_BASE = 'http://localhost:5000';

const PestlePage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/analytics/pestle/breakdown`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading" style={{ height: '60vh' }}><div className="spinner"></div></div>;

    const colors = ['#7367f0', '#28c76f', '#ff9f43', '#00cfe8', '#ea5455', '#82868b', '#9e95f5', '#48da89', '#ffb976'];

    const distributionChart = {
        labels: data?.map(d => d._id) || [],
        datasets: [{ data: data?.map(d => d.totalCount) || [], backgroundColor: colors, borderWidth: 0, cutout: '55%' }]
    };

    const intensityChart = {
        labels: data?.map(d => d._id) || [],
        datasets: [{ label: 'Avg Intensity', data: data?.map(d => d.overallAvgIntensity?.toFixed(2)) || [], backgroundColor: colors, borderRadius: 6 }]
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Activity /> PESTLE Analysis
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Political, Economic, Social, Technological, Legal, Environmental factors</p>
            </div>

            <div className="charts-grid">
                <div className="card">
                    <div className="card-header"><h3 className="card-title">PESTLE Distribution</h3></div>
                    <div className="card-body"><div className="chart-container"><Doughnut data={distributionChart} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>
                </div>
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Avg Intensity by Category</h3></div>
                    <div className="card-body"><div className="chart-container"><Bar data={intensityChart} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title">PESTLE Breakdown by Sector</h3></div>
                <div className="card-body">
                    <table className="data-table">
                        <thead><tr><th>Category</th><th>Total Insights</th><th>Top Sectors</th><th>Avg Intensity</th><th>Avg Likelihood</th></tr></thead>
                        <tbody>
                            {data?.map((item, i) => (
                                <tr key={i}>
                                    <td><span className="badge badge-primary">{item._id}</span></td>
                                    <td>{item.totalCount}</td>
                                    <td>{item.sectors?.slice(0, 3).map(s => s.sector).filter(Boolean).join(', ') || 'N/A'}</td>
                                    <td>{item.overallAvgIntensity?.toFixed(2) || 'N/A'}</td>
                                    <td>{item.overallAvgLikelihood?.toFixed(2) || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PestlePage;
