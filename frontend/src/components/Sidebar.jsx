import { LayoutDashboard, BarChart3, Filter, FileDown, Activity, Globe, TrendingUp, Database, LogOut } from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate, user, onLogout }) => {
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
                        {navItems.filter(item => item.section === section).map(item => (
                            <div key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
                                <item.icon className="nav-item-icon" />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            {user && (
                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                        <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
