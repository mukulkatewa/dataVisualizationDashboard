import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const InsightsTable = ({ filters }) => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadInsights();
    }, [filters, page]);

    const loadInsights = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit: 15 });
            Object.keys(filters || {}).forEach(k => { if (filters[k]) params.append(k, filters[k]); });

            const res = await fetch(`${API_BASE}/api/insights/filter?${params}`);
            const data = await res.json();

            if (data.success) {
                setInsights(data.data);
                setTotalPages(data.totalPages);
                setTotal(data.total);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading" style={{ height: '60vh' }}><div className="spinner"></div></div>;

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Insights Data</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Showing {insights.length} of {total.toLocaleString()} total insights</p>
            </div>

            <div className="card">
                <div className="card-body" style={{ padding: 0, overflow: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>Title</th><th>Topic</th><th>Sector</th><th>Region</th><th>Intensity</th><th>Likelihood</th><th>Year</th></tr>
                        </thead>
                        <tbody>
                            {insights.map((item, i) => (
                                <tr key={item._id || i}>
                                    <td style={{ maxWidth: '280px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(item.title || 'N/A').substring(0, 50)}...</span>
                                            {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}><ExternalLink size={12} /></a>}
                                        </div>
                                    </td>
                                    <td><span className="badge badge-primary">{item.topic || 'N/A'}</span></td>
                                    <td>{item.sector || 'N/A'}</td>
                                    <td>{item.region || 'N/A'}</td>
                                    <td><span className="badge badge-warning">{item.intensity || 0}</span></td>
                                    <td><span className="badge badge-info">{item.likelihood || 0}</span></td>
                                    <td>{item.end_year || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Page {page} of {totalPages}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /> Prev</button>
                        <button className="btn btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next <ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightsTable;
