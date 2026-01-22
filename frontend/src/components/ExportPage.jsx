import { useState } from 'react';
import { FileDown, Download, FileJson, FileSpreadsheet } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ExportPage = () => {
    const [exporting, setExporting] = useState(null);

    const handleExport = async (format) => {
        setExporting(format);
        try {
            window.open(`${API_BASE}/api/export/${format}`, '_blank');
        } catch (err) {
            console.error('Export error:', err);
        } finally {
            setTimeout(() => setExporting(null), 1000);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileDown /> Export Data
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Download insights data in various formats</p>
            </div>

            <div className="stats-grid">
                <div className="card" style={{ cursor: 'pointer' }} onClick={() => handleExport('json')}>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '32px' }}>
                        <div className="stat-icon primary"><FileJson size={24} /></div>
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Export as JSON</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Download all insights as JSON file</p>
                        </div>
                        {exporting === 'json' && <div className="spinner" style={{ width: '24px', height: '24px' }}></div>}
                    </div>
                </div>

                <div className="card" style={{ cursor: 'pointer' }} onClick={() => handleExport('csv')}>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '32px' }}>
                        <div className="stat-icon success"><FileSpreadsheet size={24} /></div>
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Export as CSV</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Download all insights as CSV file</p>
                        </div>
                        {exporting === 'csv' && <div className="spinner" style={{ width: '24px', height: '24px' }}></div>}
                    </div>
                </div>

                <div className="card" style={{ cursor: 'pointer' }} onClick={() => handleExport('stats')}>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '32px' }}>
                        <div className="stat-icon warning"><Download size={24} /></div>
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Export Statistics</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Download aggregated statistics</p>
                        </div>
                        {exporting === 'stats' && <div className="spinner" style={{ width: '24px', height: '24px' }}></div>}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header"><h3 className="card-title">Export Options</h3></div>
                <div className="card-body">
                    <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                        You can also export filtered data by applying filters on the Dashboard page first.
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px' }}>
                        <li><strong>JSON:</strong> Full data with all fields, ideal for developers</li>
                        <li><strong>CSV:</strong> Spreadsheet format, opens in Excel/Google Sheets</li>
                        <li><strong>Statistics:</strong> Aggregated metrics and summary data</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExportPage;
