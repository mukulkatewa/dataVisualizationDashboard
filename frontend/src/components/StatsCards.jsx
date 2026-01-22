import { Database, Activity, TrendingUp, Globe } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="stat-card">
        <div className={`stat-icon ${color}`}>
            <Icon size={24} />
        </div>
        <div className="stat-content">
            <h3>{value}</h3>
            <p>{title}</p>
        </div>
    </div>
);

const StatsCards = ({ overview }) => {
    if (!overview) return null;

    const stats = [
        { title: 'Total Insights', value: overview.total?.toLocaleString() || '0', icon: Database, color: 'primary' },
        { title: 'Avg Intensity', value: overview.avgIntensity?.toFixed(1) || '0', icon: Activity, color: 'success' },
        { title: 'Avg Likelihood', value: overview.avgLikelihood?.toFixed(1) || '0', icon: TrendingUp, color: 'warning' },
        { title: 'Countries', value: overview.countryCount || '0', icon: Globe, color: 'info' }
    ];

    return (
        <div className="stats-grid">
            {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
        </div>
    );
};

export default StatsCards;
