import { LayoutDashboard, BarChart3, Filter, FileDown, Activity, Globe, TrendingUp, Database } from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Main' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'Main' },
        { id: 'insights', label: 'Insights', icon: Database, section: 'Data' },
        { id: 'filters', label: 'Filters', icon: Filter, section: 'Data' },
        { id: 'geographic', label: 'Geographic', icon: Globe, section: 'Analysis' },
        { id: 'pestle', label: 'PESTLE', icon: Activity, section: 'Analysis' },
        { id: 'trends', label: 'Trends', icon: TrendingUp, section: 'Analysis' },
        { id: 'export', label: 'Export Data', icon: FileDown, section: 'Export' }
    ];

    const sections = ['Main', 'Data', 'Analysis', 'Export'];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">B</div>
                <span className="sidebar-title">Blackcoffer</span>
            </div>

            <nav className="sidebar-nav">
                {sections.map(section => (
                    <div key={section}>
                        <div className="nav-section">{section}</div>
                        {navItems
                            .filter(item => item.section === section)
                            .map(item => (
                                <div
                                    key={item.id}
                                    className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                                    onClick={() => onNavigate(item.id)}
                                >
                                    <item.icon className="nav-item-icon" />
                                    <span>{item.label}</span>
                                </div>
                            ))
                        }
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
