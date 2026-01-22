import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TrendsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [yearlyRes, topicRes] = await Promise.all([
                fetch(`${API_BASE}/api/analytics/trends/yearly`),
                fetch(`${API_BASE}/api/analytics/trends/topic?limit=10`)
            ]);
            const yearly = await yearlyRes.json();
            const topic = await topicRes.json();

            setData({ yearly: yearly.data, topics: topic.data });
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading" style={{ height: '60vh' }}><div className="spinner"></div></div>;

    const yearlyChart = {
        labels: data?.yearly?.map(d => d._id) || [],
        datasets: [
            { label: 'Avg Intensity', data: data?.yearly?.map(d => d.avgIntensity?.toFixed(2)) || [], borderColor: '#7367f0', backgroundColor: 'rgba(115, 103, 240, 0.1)', fill: true, tension: 0.4 },
            { label: 'Avg Likelihood', data: data?.yearly?.map(d => d.avgLikelihood?.toFixed(2)) || [], borderColor: '#28c76f', backgroundColor: 'rgba(40, 199, 111, 0.1)', fill: true, tension: 0.4 }
        ]
    };

    const countChart = {
        labels: data?.yearly?.map(d => d._id) || [],
        datasets: [{ label: 'Insights Count', data: data?.yearly?.map(d => d.count) || [], backgroundColor: '#00cfe8', borderRadius: 6 }]
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TrendingUp /> Trends Analysis
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Yearly trends and topic analysis</p>
            </div>

            <div className="charts-grid">
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Metric Trends by Year</h3></div>
                    <div className="card-body"><div className="chart-container"><Line data={yearlyChart} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>
                </div>
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Insights Count by Year</h3></div>
                    <div className="card-body"><div className="chart-container"><Bar data={countChart} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title">Top Topics Over Time</h3></div>
                <div className="card-body">
                    <table className="data-table">
                        <thead><tr><th>Topic</th><th>Total Insights</th><th>Years Active</th></tr></thead>
                        <tbody>
                            {data?.topics?.map((item, i) => (
                                <tr key={i}>
                                    <td><span className="badge badge-primary">{item._id}</span></td>
                                    <td>{item.totalCount}</td>
                                    <td>{item.yearlyData?.map(y => y.year).filter(Boolean).join(', ') || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TrendsPage;
