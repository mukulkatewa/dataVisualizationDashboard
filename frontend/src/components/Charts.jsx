import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const colors = ['#7367f0', '#28c76f', '#ff9f43', '#00cfe8', '#ea5455', '#82868b', '#9e95f5', '#48da89', '#ffb976', '#1ce7ff'];
const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } };

const EmptyChart = ({ title }) => (
    <div className="card">
        <div className="card-header"><h3 className="card-title">{title}</h3></div>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No data available</p>
        </div>
    </div>
);

export const IntensityBySectorChart = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <EmptyChart title="Intensity by Sector" />;
    const chartData = {
        labels: data.slice(0, 12).map(d => (d._id || 'N/A').substring(0, 15)),
        datasets: [{ label: 'Avg Intensity', data: data.slice(0, 12).map(d => parseFloat(d.avgIntensity) || 0), backgroundColor: colors, borderRadius: 6 }]
    };
    return <div className="card"><div className="card-header"><h3 className="card-title">Intensity by Sector</h3></div><div className="card-body"><div className="chart-container"><Bar data={chartData} options={{ ...opts, indexAxis: 'y' }} /></div></div></div>;
};

export const PestleChart = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <EmptyChart title="PESTLE Distribution" />;
    const chartData = {
        labels: data.map(d => d._id || 'N/A'),
        datasets: [{ data: data.map(d => d.count || 0), backgroundColor: colors, borderWidth: 0, cutout: '60%' }]
    };
    return <div className="card"><div className="card-header"><h3 className="card-title">PESTLE Distribution</h3></div><div className="card-body"><div className="chart-container"><Doughnut data={chartData} options={opts} /></div></div></div>;
};

export const TopTopicsChart = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <EmptyChart title="Top Topics" />;
    const chartData = {
        labels: data.slice(0, 8).map(d => d._id || 'N/A'),
        datasets: [{ label: 'Count', data: data.slice(0, 8).map(d => d.count || 0), backgroundColor: colors, borderRadius: 6 }]
    };
    return <div className="card"><div className="card-header"><h3 className="card-title">Top Topics</h3></div><div className="card-body"><div className="chart-container"><Bar data={chartData} options={opts} /></div></div></div>;
};

export const RegionsChart = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <EmptyChart title="Top Regions" />;
    const chartData = {
        labels: data.map(d => (d._id || 'N/A').substring(0, 12)),
        datasets: [{ data: data.map(d => d.count || 0), backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }]
    };
    return <div className="card"><div className="card-header"><h3 className="card-title">Top Regions</h3></div><div className="card-body"><div className="chart-container"><Pie data={chartData} options={opts} /></div></div></div>;
};

export const LikelihoodByRegionChart = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <EmptyChart title="Likelihood by Region" />;
    const chartData = {
        labels: data.slice(0, 10).map(d => (d._id || 'N/A').substring(0, 12)),
        datasets: [{ label: 'Avg Likelihood', data: data.slice(0, 10).map(d => parseFloat(d.avgLikelihood) || 0), backgroundColor: '#28c76f', borderRadius: 6 }]
    };
    return <div className="card"><div className="card-header"><h3 className="card-title">Likelihood by Region</h3></div><div className="card-body"><div className="chart-container"><Bar data={chartData} options={opts} /></div></div></div>;
};

export const RelevanceByTopicChart = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <EmptyChart title="Relevance by Topic" />;
    const chartData = {
        labels: data.slice(0, 10).map(d => d._id || 'N/A'),
        datasets: [{ label: 'Avg Relevance', data: data.slice(0, 10).map(d => parseFloat(d.avgRelevance) || 0), backgroundColor: '#ff9f43', borderRadius: 6 }]
    };
    return <div className="card"><div className="card-header"><h3 className="card-title">Relevance by Topic</h3></div><div className="card-body"><div className="chart-container"><Bar data={chartData} options={{ ...opts, indexAxis: 'y' }} /></div></div></div>;
};

export const CountByYearChart = ({ data }) => {
    console.log('CountByYearChart received data:', data);
    if (!data || !Array.isArray(data) || data.length === 0) return <EmptyChart title="Insights by Year" />;

    // Filter to realistic years only (2015-2050) for better visualization
    const filtered = data.filter(d => d._id >= 2015 && d._id <= 2050);
    const sorted = [...filtered].sort((a, b) => a._id - b._id);

    const chartData = {
        labels: sorted.map(d => String(d._id)),
        datasets: [{
            label: 'Count',
            data: sorted.map(d => d.count || 0),
            borderColor: '#7367f0',
            backgroundColor: 'rgba(115, 103, 240, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#7367f0'
        }]
    };
    return (
        <div className="card">
            <div className="card-header"><h3 className="card-title">Insights by Year ({sorted.length} years)</h3></div>
            <div className="card-body">
                <div className="chart-container">
                    <Line data={chartData} options={opts} />
                </div>
            </div>
        </div>
    );
};

export const TopCountriesChart = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <EmptyChart title="Top Countries" />;
    const chartData = {
        labels: data.slice(0, 12).map(d => d._id || 'N/A'),
        datasets: [{ label: 'Count', data: data.slice(0, 12).map(d => d.count || 0), backgroundColor: '#00cfe8', borderRadius: 6 }]
    };
    return <div className="card"><div className="card-header"><h3 className="card-title">Top Countries</h3></div><div className="card-body"><div className="chart-container"><Bar data={chartData} options={{ ...opts, indexAxis: 'y' }} /></div></div></div>;
};

export const YearRangeCard = ({ data, overview }) => (
    <div className="card">
        <div className="card-header"><h3 className="card-title">Overview</h3></div>
        <div className="card-body">
            <table className="data-table">
                <tbody>
                    <tr><td>Year Range</td><td><span className="badge badge-primary">{data?.minYear || 'N/A'} - {data?.maxYear || 'N/A'}</span></td></tr>
                    <tr><td>Total Topics</td><td><span className="badge badge-success">{overview?.topicCount || 0}</span></td></tr>
                    <tr><td>Total Sectors</td><td><span className="badge badge-warning">{overview?.sectorCount || 0}</span></td></tr>
                    <tr><td>Total Sources</td><td><span className="badge badge-info">{overview?.sourceCount || 0}</span></td></tr>
                    <tr><td>Avg Relevance</td><td><span className="badge badge-primary">{overview?.avgRelevance?.toFixed(2) || 0}</span></td></tr>
                </tbody>
            </table>
        </div>
    </div>
);
