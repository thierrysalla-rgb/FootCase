// Build Trigger: 2026-02-08 01:21
import React from 'react';
import {
    Trophy,
    Users,
    Calendar,
    BarChart3,
    LayoutDashboard,
    TrendingUp,
    Shield,
    Settings,
    BadgeCheck,
    LogOut,
    LogIn
} from 'lucide-react';
import './Sidebar.css';
import { useData } from '../../store/DataContext';


const Sidebar = ({ activeView, setView }) => {
    const { user, isAdmin, logout } = useData();

    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'matches', label: 'Matchs & Compos', icon: Calendar },
        { id: 'players', label: 'Effectif', icon: Users },
        { id: 'staff', label: 'Encadrement', icon: BadgeCheck },
        { id: 'standings', label: 'Classements', icon: Trophy },
        { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    ];

    return (
        <aside className="sidebar glass">
            <div className="sidebar-brand">
                <div className="brand-logo">
                    <Trophy size={28} color="var(--primary)" />
                </div>
                <div className="brand-info">
                    <span className="brand-name">CASE2</span>
                    <span className="brand-season">Saison 2025/26</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                        onClick={() => setView(item.id)}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
                    onClick={() => setView('settings')}
                >
                    <Settings size={20} />
                    <span>Paramètres</span>
                </button>

                {isAdmin ? (
                    <button className="nav-item logout-btn" onClick={logout}>
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                ) : (
                    <button
                        className={`nav-item login-btn ${activeView === 'login' ? 'active' : ''}`}
                        onClick={() => setView('login')}
                    >
                        <LogIn size={20} />
                        <span>Connexion</span>
                    </button>
                )}

                {isAdmin && (
                    <div className="admin-badge">
                        <Shield size={12} />
                        <span>Admin</span>
                    </div>
                )}
            </div>

        </aside>
    );
};

export default Sidebar;
